import { ConvexError, v } from 'convex/values'
import type { Id } from './_generated/dataModel'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { mutation, query } from './_generated/server'
import { requireAuth } from './lib/auth'

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
 * Get user's household with members and user details.
 * Returns null if user is not in a household.
 */
export const me = query({
	args: {},
	handler: async (ctx) => {
		const userId = await requireAuth(ctx)
		const membership = await getUserMembership(ctx, userId)

		if (!membership) {
			return null
		}

		const household = await ctx.db.get(membership.householdId)
		if (!household) {
			return null
		}

		// Get all members of the household
		const members = await ctx.db
			.query('householdMembers')
			.withIndex('by_household', (q) => q.eq('householdId', membership.householdId))
			.collect()

		// Get user details for each member
		const membersWithUsers = await Promise.all(
			members.map(async (member) => {
				const user = await ctx.db.get(member.userId)
				return {
					...member,
					user: user
						? {
								_id: user._id,
								name: user.name,
								email: user.email,
								image: user.image,
							}
						: null,
				}
			})
		)

		return {
			...household,
			members: membersWithUsers,
		}
	},
})

/**
 * Create household and auto-add creator as member.
 * Rejects if user is already in a household.
 */
export const create = mutation({
	args: {
		name: v.string(),
		splitMode: v.union(v.literal('equal'), v.literal('income_proportional')),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx)

		// Check if user is already in a household
		const existingMembership = await getUserMembership(ctx, userId)
		if (existingMembership) {
			throw new ConvexError({
				code: 'CONFLICT',
				message: 'User is already in a household',
			})
		}

		// Create household
		const householdId = await ctx.db.insert('households', {
			name: args.name,
			splitMode: args.splitMode,
		})

		// Add creator as member
		await ctx.db.insert('householdMembers', {
			householdId,
			userId,
			joinedAt: Date.now(),
		})

		return householdId
	},
})

/**
 * Update household name/splitMode (validates membership).
 */
export const update = mutation({
	args: {
		id: v.id('households'),
		name: v.optional(v.string()),
		splitMode: v.optional(v.union(v.literal('equal'), v.literal('income_proportional'))),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx)

		// Verify user is a member of this household
		const membership = await ctx.db
			.query('householdMembers')
			.withIndex('by_household_user', (q) => q.eq('householdId', args.id).eq('userId', userId))
			.first()

		if (!membership) {
			throw new ConvexError({
				code: 'FORBIDDEN',
				message: 'User is not a member of this household',
			})
		}

		const household = await ctx.db.get(args.id)
		if (!household) {
			throw new ConvexError({ code: 'NOT_FOUND', message: 'Household not found' })
		}

		// Build updates
		const { id, ...updates } = args
		const filteredUpdates = Object.fromEntries(
			Object.entries(updates).filter(([_, v]) => v !== undefined)
		)

		if (Object.keys(filteredUpdates).length > 0) {
			await ctx.db.patch(args.id, filteredUpdates)
		}

		return { success: true }
	},
})

/**
 * Leave household.
 * - Removes user's membership
 * - Sets user's household expenses to active=false
 * - Deletes household if empty (cascades: expenses, invitations)
 */
export const leave = mutation({
	args: { id: v.id('households') },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx)

		// Verify user is a member of this household
		const membership = await ctx.db
			.query('householdMembers')
			.withIndex('by_household_user', (q) => q.eq('householdId', args.id).eq('userId', userId))
			.first()

		if (!membership) {
			throw new ConvexError({
				code: 'FORBIDDEN',
				message: 'User is not a member of this household',
			})
		}

		// Disable user's household expenses (set active=false)
		const userExpenses = await ctx.db
			.query('expenses')
			.withIndex('by_household', (q) => q.eq('householdId', args.id))
			.filter((q) => q.eq(q.field('userId'), userId))
			.collect()

		for (const expense of userExpenses) {
			await ctx.db.patch(expense._id, { active: false })
		}

		// Remove membership
		await ctx.db.delete(membership._id)

		// Check if household is now empty
		const remainingMembers = await ctx.db
			.query('householdMembers')
			.withIndex('by_household', (q) => q.eq('householdId', args.id))
			.first()

		if (!remainingMembers) {
			// Household is empty - cascade delete

			// Delete all household expenses
			const allExpenses = await ctx.db
				.query('expenses')
				.withIndex('by_household', (q) => q.eq('householdId', args.id))
				.collect()

			for (const expense of allExpenses) {
				await ctx.db.delete(expense._id)
			}

			// Delete all invitations
			const invitations = await ctx.db
				.query('invitations')
				.withIndex('by_household', (q) => q.eq('householdId', args.id))
				.collect()

			for (const invitation of invitations) {
				await ctx.db.delete(invitation._id)
			}

			// Delete household
			await ctx.db.delete(args.id)
		}

		return { success: true }
	},
})
