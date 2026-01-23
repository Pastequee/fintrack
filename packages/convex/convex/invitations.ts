import { ConvexError, v } from 'convex/values'
import { internal } from './_generated/api'
import type { Id } from './_generated/dataModel'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { mutation, query } from './_generated/server'
import { requireAuth, requireUser } from './lib/auth'

/**
 * Get user's household membership or null if not a member.
 */
function getUserMembership(ctx: QueryCtx | MutationCtx, userId: Id<'users'>) {
	return ctx.db
		.query('householdMembers')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.first()
}

/**
 * Get pending invitations for user's household.
 * Only returns pending invitations, excludes expired/accepted/declined.
 */
export const list = query({
	args: {},
	handler: async (ctx) => {
		const userId = await requireAuth(ctx)
		const membership = await getUserMembership(ctx, userId)

		if (!membership) {
			return []
		}

		const invitations = await ctx.db
			.query('invitations')
			.withIndex('by_household', (q) => q.eq('householdId', membership.householdId))
			.collect()

		// Filter to pending only and check expiration
		const now = Date.now()
		return invitations.filter((inv) => inv.status === 'pending' && inv.expiresAt > now)
	},
})

/**
 * Get pending invitations sent to the current user's email.
 */
export const pending = query({
	args: {},
	handler: async (ctx) => {
		const { user } = await requireUser(ctx)
		const email = user.email

		if (!email) {
			return []
		}

		const invitations = await ctx.db
			.query('invitations')
			.withIndex('by_email', (q) => q.eq('email', email))
			.collect()

		// Filter to pending only and check expiration
		const now = Date.now()
		const pendingInvitations = invitations.filter(
			(inv) => inv.status === 'pending' && inv.expiresAt > now
		)

		// Get household details for each invitation
		return Promise.all(
			pendingInvitations.map(async (inv) => {
				const household = await ctx.db.get(inv.householdId)
				const inviter = await ctx.db.get(inv.invitedBy)
				return {
					...inv,
					household: household ? { _id: household._id, name: household.name } : null,
					inviter: inviter ? { _id: inviter._id, name: inviter.name, email: inviter.email } : null,
				}
			})
		)
	},
})

/**
 * Get invitation by token.
 * Returns 410-equivalent error if expired/used.
 */
export const byToken = query({
	args: { token: v.string() },
	handler: async (ctx, args) => {
		const invitation = await ctx.db
			.query('invitations')
			.withIndex('by_token', (q) => q.eq('token', args.token))
			.first()

		if (!invitation) {
			throw new ConvexError({ code: 'NOT_FOUND', message: 'Invitation not found' })
		}

		// Check if already used
		if (invitation.status === 'accepted' || invitation.status === 'declined') {
			throw new ConvexError({ code: 'GONE', message: 'Invitation has already been used' })
		}

		// Check if expired
		if (invitation.status === 'expired' || invitation.expiresAt < Date.now()) {
			throw new ConvexError({ code: 'GONE', message: 'Invitation has expired' })
		}

		// Get household and inviter details
		const household = await ctx.db.get(invitation.householdId)
		const inviter = await ctx.db.get(invitation.invitedBy)

		return {
			...invitation,
			household: household ? { _id: household._id, name: household.name } : null,
			inviter: inviter ? { _id: inviter._id, name: inviter.name, email: inviter.email } : null,
		}
	},
})

/**
 * Send invitation to email.
 * - Validates sender is in a household
 * - Prevents inviting existing members
 * - Prevents duplicate pending invitations
 * - Generates UUID token
 * - Sets 7-day expiration
 */
export const send = mutation({
	args: { email: v.string() },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx)
		const membership = await getUserMembership(ctx, userId)

		if (!membership) {
			throw new ConvexError({
				code: 'FORBIDDEN',
				message: 'You must be in a household to send invitations',
			})
		}

		// Check if email belongs to existing member
		const existingUser = await ctx.db
			.query('users')
			.withIndex('email', (q) => q.eq('email', args.email))
			.first()

		if (existingUser) {
			const existingMembership = await ctx.db
				.query('householdMembers')
				.withIndex('by_household_user', (q) =>
					q.eq('householdId', membership.householdId).eq('userId', existingUser._id)
				)
				.first()

			if (existingMembership) {
				throw new ConvexError({
					code: 'CONFLICT',
					message: 'User is already a member of this household',
				})
			}
		}

		// Check for duplicate pending invitation
		const existingInvitations = await ctx.db
			.query('invitations')
			.withIndex('by_email', (q) => q.eq('email', args.email))
			.collect()

		const duplicatePending = existingInvitations.find(
			(inv) =>
				inv.householdId === membership.householdId &&
				inv.status === 'pending' &&
				inv.expiresAt > Date.now()
		)

		if (duplicatePending) {
			throw new ConvexError({
				code: 'CONFLICT',
				message: 'A pending invitation already exists for this email',
			})
		}

		// Generate UUID token
		const token = crypto.randomUUID()

		// Set 7-day expiration
		const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000

		const invitationId = await ctx.db.insert('invitations', {
			householdId: membership.householdId,
			invitedBy: userId,
			email: args.email,
			token,
			status: 'pending',
			expiresAt,
		})

		// Get inviter and household details for email
		const inviter = await ctx.db.get(userId)
		const household = await ctx.db.get(membership.householdId)

		// Send invitation email asynchronously (don't block mutation)
		if (inviter && household) {
			await ctx.scheduler.runAfter(0, internal.email.sendInvitation, {
				to: args.email,
				inviterName: inviter.name ?? inviter.email ?? 'Someone',
				householdName: household.name,
				token,
			})
		}

		return { invitationId, token }
	},
})

/**
 * Accept invitation by token.
 * - Validates user is not already in a household
 * - Adds user to household
 * - Marks invitation as accepted
 */
export const accept = mutation({
	args: { token: v.string() },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx)

		// Check if user already in a household
		const existingMembership = await getUserMembership(ctx, userId)
		if (existingMembership) {
			throw new ConvexError({
				code: 'CONFLICT',
				message: 'You are already a member of a household',
			})
		}

		// Get invitation
		const invitation = await ctx.db
			.query('invitations')
			.withIndex('by_token', (q) => q.eq('token', args.token))
			.first()

		if (!invitation) {
			throw new ConvexError({ code: 'NOT_FOUND', message: 'Invitation not found' })
		}

		// Check if already used
		if (invitation.status === 'accepted' || invitation.status === 'declined') {
			throw new ConvexError({ code: 'GONE', message: 'Invitation has already been used' })
		}

		// Check if expired
		if (invitation.status === 'expired' || invitation.expiresAt < Date.now()) {
			// Update status to expired if not already
			if (invitation.status !== 'expired') {
				await ctx.db.patch(invitation._id, { status: 'expired' })
			}
			throw new ConvexError({ code: 'GONE', message: 'Invitation has expired' })
		}

		// Verify household still exists
		const household = await ctx.db.get(invitation.householdId)
		if (!household) {
			throw new ConvexError({ code: 'NOT_FOUND', message: 'Household no longer exists' })
		}

		// Add user to household
		await ctx.db.insert('householdMembers', {
			householdId: invitation.householdId,
			userId,
			joinedAt: Date.now(),
		})

		// Mark invitation as accepted
		await ctx.db.patch(invitation._id, { status: 'accepted' })

		return { success: true, householdId: invitation.householdId }
	},
})

/**
 * Decline invitation by token.
 */
export const decline = mutation({
	args: { token: v.string() },
	handler: async (ctx, args) => {
		await requireAuth(ctx)

		const invitation = await ctx.db
			.query('invitations')
			.withIndex('by_token', (q) => q.eq('token', args.token))
			.first()

		if (!invitation) {
			throw new ConvexError({ code: 'NOT_FOUND', message: 'Invitation not found' })
		}

		// Check if already used
		if (invitation.status === 'accepted' || invitation.status === 'declined') {
			throw new ConvexError({ code: 'GONE', message: 'Invitation has already been used' })
		}

		// Mark as declined (even if expired, we can still decline)
		await ctx.db.patch(invitation._id, { status: 'declined' })

		return { success: true }
	},
})

/**
 * Revoke (delete) invitation.
 * Validates sender is a member of the household.
 */
export const revoke = mutation({
	args: { id: v.id('invitations') },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx)

		const invitation = await ctx.db.get(args.id)
		if (!invitation) {
			throw new ConvexError({ code: 'NOT_FOUND', message: 'Invitation not found' })
		}

		// Verify user is a member of the household
		const membership = await ctx.db
			.query('householdMembers')
			.withIndex('by_household_user', (q) =>
				q.eq('householdId', invitation.householdId).eq('userId', userId)
			)
			.first()

		if (!membership) {
			throw new ConvexError({
				code: 'FORBIDDEN',
				message: 'You must be a member of the household to revoke invitations',
			})
		}

		await ctx.db.delete(args.id)

		return { success: true }
	},
})
