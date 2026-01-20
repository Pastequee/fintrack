import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getCurrentUser, requireRole, requireUser } from './lib/auth'

/**
 * Get current authenticated user.
 * Returns null if not authenticated.
 */
export const me = query({
	args: {},
	handler: async (ctx) => {
		const result = await getCurrentUser(ctx)
		if (!result) return null

		const { user } = result
		return {
			id: user._id,
			name: user.name,
			email: user.email,
			image: user.image,
			role: user.role ?? 'user',
		}
	},
})

/**
 * List all users (admin only).
 */
export const list = query({
	args: {},
	handler: async (ctx) => {
		await requireRole(ctx, 'admin')

		const users = await ctx.db.query('users').collect()
		return users.map((user) => ({
			id: user._id,
			name: user.name,
			email: user.email,
			image: user.image,
			role: user.role ?? 'user',
			banned: user.banned ?? false,
			banReason: user.banReason,
			banExpires: user.banExpires,
		}))
	},
})

/**
 * Update user role (admin only).
 */
export const updateRole = mutation({
	args: {
		userId: v.id('users'),
		role: v.union(v.literal('admin'), v.literal('user')),
	},
	handler: async (ctx, args) => {
		const { user: admin } = await requireRole(ctx, 'admin')

		// Prevent admin from removing their own admin role
		if (args.userId === admin._id && args.role !== 'admin') {
			throw new Error('Cannot remove your own admin role')
		}

		await ctx.db.patch(args.userId, { role: args.role })
		return { success: true }
	},
})

/**
 * Ban or unban a user (admin only).
 */
export const ban = mutation({
	args: {
		userId: v.id('users'),
		banned: v.boolean(),
		reason: v.optional(v.string()),
		expiresAt: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const { user: admin } = await requireRole(ctx, 'admin')

		// Prevent admin from banning themselves
		if (args.userId === admin._id) {
			throw new Error('Cannot ban yourself')
		}

		const targetUser = await ctx.db.get(args.userId)
		if (!targetUser) {
			throw new Error('User not found')
		}

		// Prevent banning other admins
		if (targetUser.role === 'admin') {
			throw new Error('Cannot ban an admin')
		}

		await ctx.db.patch(args.userId, {
			banned: args.banned,
			banReason: args.banned ? args.reason : undefined,
			banExpires: args.banned ? args.expiresAt : undefined,
		})

		return { success: true }
	},
})

/**
 * Update current user's profile.
 */
export const updateProfile = mutation({
	args: {
		name: v.optional(v.string()),
		image: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { userId } = await requireUser(ctx)

		const updates: { name?: string; image?: string } = {}
		if (args.name !== undefined) updates.name = args.name
		if (args.image !== undefined) updates.image = args.image

		if (Object.keys(updates).length > 0) {
			await ctx.db.patch(userId, updates)
		}

		return { success: true }
	},
})
