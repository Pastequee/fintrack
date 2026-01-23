import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { requireAuth } from './lib/auth'

/**
 * List user's personal expenses (householdId undefined) ordered by creation desc.
 * Includes tag data via manual join.
 */
export const list = query({
	args: {},
	handler: async (ctx) => {
		const userId = await requireAuth(ctx)

		const expenses = await ctx.db
			.query('expenses')
			.withIndex('by_user_personal', (q) => q.eq('userId', userId).eq('householdId', undefined))
			.order('desc')
			.collect()

		// Manual join for tag data
		const expensesWithTags = await Promise.all(
			expenses.map(async (expense) => {
				const tag = expense.tagId ? await ctx.db.get(expense.tagId) : null
				return { ...expense, tag }
			})
		)

		return expensesWithTags
	},
})

/**
 * Get single expense by ID (validates ownership).
 */
export const get = query({
	args: { id: v.id('expenses') },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx)

		const expense = await ctx.db.get(args.id)
		if (!expense || expense.userId !== userId) {
			return null
		}

		// Include tag data
		const tag = expense.tagId ? await ctx.db.get(expense.tagId) : null
		return { ...expense, tag }
	},
})

/**
 * Create personal expense for authenticated user.
 * Validates type logic: one_time requires targetDate, recurring requires period+startDate.
 */
export const create = mutation({
	args: {
		name: v.string(),
		amount: v.number(),
		type: v.union(v.literal('one_time'), v.literal('recurring')),
		tagId: v.optional(v.id('tags')),
		period: v.optional(
			v.union(v.literal('daily'), v.literal('weekly'), v.literal('monthly'), v.literal('yearly'))
		),
		startDate: v.optional(v.string()),
		endDate: v.optional(v.string()),
		targetDate: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx)

		// Validate type logic
		if (args.type === 'one_time') {
			if (!args.targetDate) {
				throw new ConvexError({
					code: 'BAD_REQUEST',
					message: 'one_time expense requires targetDate',
				})
			}
		} else {
			// recurring
			if (!args.period) {
				throw new ConvexError({ code: 'BAD_REQUEST', message: 'recurring expense requires period' })
			}
			if (!args.startDate) {
				throw new ConvexError({
					code: 'BAD_REQUEST',
					message: 'recurring expense requires startDate',
				})
			}
		}

		// Validate tag ownership if provided
		if (args.tagId) {
			const tag = await ctx.db.get(args.tagId)
			if (!tag || tag.userId !== userId) {
				throw new ConvexError({ code: 'NOT_FOUND', message: 'Tag not found' })
			}
		}

		return ctx.db.insert('expenses', {
			userId,
			householdId: undefined, // personal expense
			tagId: args.tagId,
			name: args.name,
			amount: args.amount,
			type: args.type,
			period: args.period,
			startDate: args.startDate,
			endDate: args.endDate,
			targetDate: args.targetDate,
			active: true,
		})
	},
})

/**
 * Update personal expense (validates ownership and type logic).
 */
export const update = mutation({
	args: {
		id: v.id('expenses'),
		name: v.optional(v.string()),
		amount: v.optional(v.number()),
		type: v.optional(v.union(v.literal('one_time'), v.literal('recurring'))),
		tagId: v.optional(v.id('tags')),
		period: v.optional(
			v.union(v.literal('daily'), v.literal('weekly'), v.literal('monthly'), v.literal('yearly'))
		),
		startDate: v.optional(v.string()),
		endDate: v.optional(v.string()),
		targetDate: v.optional(v.string()),
		active: v.optional(v.boolean()),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx)

		const expense = await ctx.db.get(args.id)
		if (!expense || expense.userId !== userId) {
			throw new ConvexError({ code: 'NOT_FOUND', message: 'Expense not found' })
		}

		// Validate tag ownership if provided
		if (args.tagId) {
			const tag = await ctx.db.get(args.tagId)
			if (!tag || tag.userId !== userId) {
				throw new ConvexError({ code: 'NOT_FOUND', message: 'Tag not found' })
			}
		}

		// Determine final type (updated or existing)
		const finalType = args.type ?? expense.type

		// Build updates object
		const { id, ...updates } = args
		const filteredUpdates = Object.fromEntries(
			Object.entries(updates).filter(([_, v]) => v !== undefined)
		)

		// Validate type logic with merged values
		if (finalType === 'one_time') {
			const finalTargetDate = args.targetDate ?? expense.targetDate
			if (!finalTargetDate) {
				throw new ConvexError({
					code: 'BAD_REQUEST',
					message: 'one_time expense requires targetDate',
				})
			}
		} else {
			// recurring
			const finalPeriod = args.period ?? expense.period
			const finalStartDate = args.startDate ?? expense.startDate
			if (!finalPeriod) {
				throw new ConvexError({ code: 'BAD_REQUEST', message: 'recurring expense requires period' })
			}
			if (!finalStartDate) {
				throw new ConvexError({
					code: 'BAD_REQUEST',
					message: 'recurring expense requires startDate',
				})
			}
		}

		if (Object.keys(filteredUpdates).length > 0) {
			await ctx.db.patch(args.id, filteredUpdates)
		}

		return { success: true }
	},
})

/**
 * Delete expense (validates ownership).
 */
export const remove = mutation({
	args: { id: v.id('expenses') },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx)

		const expense = await ctx.db.get(args.id)
		if (!expense || expense.userId !== userId) {
			throw new ConvexError({ code: 'NOT_FOUND', message: 'Expense not found' })
		}

		await ctx.db.delete(args.id)
		return { success: true }
	},
})
