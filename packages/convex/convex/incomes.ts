import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { requireAuth } from './lib/auth'

/**
 * List authenticated user's incomes ordered by creation desc.
 */
export const list = query({
	args: {},
	handler: async (ctx) => {
		const userId = await requireAuth(ctx)

		return ctx.db
			.query('incomes')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.order('desc')
			.collect()
	},
})

/**
 * Get single income by ID (validates ownership).
 */
export const get = query({
	args: { id: v.id('incomes') },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx)

		const income = await ctx.db.get(args.id)
		if (!income || income.userId !== userId) {
			return null
		}

		return income
	},
})

/**
 * Create new income for authenticated user.
 */
export const create = mutation({
	args: {
		name: v.string(),
		amount: v.number(),
		period: v.union(
			v.literal('daily'),
			v.literal('weekly'),
			v.literal('monthly'),
			v.literal('yearly')
		),
		startDate: v.string(),
		endDate: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx)

		return ctx.db.insert('incomes', {
			userId,
			name: args.name,
			amount: args.amount,
			period: args.period,
			startDate: args.startDate,
			endDate: args.endDate,
		})
	},
})

/**
 * Update income (validates ownership).
 */
export const update = mutation({
	args: {
		id: v.id('incomes'),
		name: v.optional(v.string()),
		amount: v.optional(v.number()),
		period: v.optional(
			v.union(v.literal('daily'), v.literal('weekly'), v.literal('monthly'), v.literal('yearly'))
		),
		startDate: v.optional(v.string()),
		endDate: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx)

		const income = await ctx.db.get(args.id)
		if (!income || income.userId !== userId) {
			throw new Error('Income not found')
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
 * Delete income (validates ownership).
 */
export const remove = mutation({
	args: { id: v.id('incomes') },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx)

		const income = await ctx.db.get(args.id)
		if (!income || income.userId !== userId) {
			throw new Error('Income not found')
		}

		await ctx.db.delete(args.id)
		return { success: true }
	},
})
