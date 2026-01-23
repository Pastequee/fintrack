import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { requireAuth } from './lib/auth'

// Hex color validation regex
const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

/**
 * List authenticated user's tags ordered by creation desc.
 */
export const list = query({
	args: {},
	handler: async (ctx) => {
		const userId = await requireAuth(ctx)

		return ctx.db
			.query('tags')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.order('desc')
			.collect()
	},
})

/**
 * Create new tag for authenticated user.
 */
export const create = mutation({
	args: {
		name: v.string(),
		color: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx)

		if (!HEX_COLOR_REGEX.test(args.color)) {
			throw new ConvexError({ code: 'BAD_REQUEST', message: 'Invalid hex color format' })
		}

		return ctx.db.insert('tags', {
			userId,
			name: args.name,
			color: args.color,
		})
	},
})

/**
 * Update tag name/color (validates ownership).
 */
export const update = mutation({
	args: {
		id: v.id('tags'),
		name: v.optional(v.string()),
		color: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx)

		const tag = await ctx.db.get(args.id)
		if (!tag || tag.userId !== userId) {
			throw new ConvexError({ code: 'NOT_FOUND', message: 'Tag not found' })
		}

		if (args.color && !HEX_COLOR_REGEX.test(args.color)) {
			throw new ConvexError({ code: 'BAD_REQUEST', message: 'Invalid hex color format' })
		}

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
 * Delete tag (validates ownership).
 * Expenses with this tag will have tagId set to undefined.
 */
export const remove = mutation({
	args: { id: v.id('tags') },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx)

		const tag = await ctx.db.get(args.id)
		if (!tag || tag.userId !== userId) {
			throw new ConvexError({ code: 'NOT_FOUND', message: 'Tag not found' })
		}

		// Find all expenses with this tag and clear the tagId
		const expensesWithTag = await ctx.db
			.query('expenses')
			.filter((q) => q.eq(q.field('tagId'), args.id))
			.collect()

		for (const expense of expensesWithTag) {
			await ctx.db.patch(expense._id, { tagId: undefined })
		}

		await ctx.db.delete(args.id)
		return { success: true }
	},
})
