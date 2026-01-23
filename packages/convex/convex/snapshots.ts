import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { requireAuth } from './lib/auth'

const snapshotDataValidator = v.object({
	income: v.number(),
	personalExpenses: v.object({
		total: v.number(),
		items: v.array(
			v.object({
				id: v.id('expenses'),
				name: v.string(),
				amount: v.number(),
			})
		),
	}),
	householdShare: v.object({
		total: v.number(),
		items: v.array(
			v.object({
				id: v.id('expenses'),
				name: v.string(),
				amount: v.number(),
				yourShare: v.number(),
			})
		),
	}),
	remaining: v.number(),
})

/**
 * List user's snapshots ordered by year/month desc.
 */
export const list = query({
	args: {},
	handler: async (ctx) => {
		const userId = await requireAuth(ctx)

		const snapshots = await ctx.db
			.query('snapshots')
			.withIndex('by_user_month', (q) => q.eq('userId', userId))
			.order('desc')
			.collect()

		return snapshots
	},
})

/**
 * Get single snapshot by ID (validates ownership).
 */
export const get = query({
	args: { id: v.id('snapshots') },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx)

		const snapshot = await ctx.db.get(args.id)
		if (!snapshot || snapshot.userId !== userId) {
			return null
		}

		return snapshot
	},
})

/**
 * Get snapshot by year/month for authenticated user.
 */
export const getByMonth = query({
	args: {
		year: v.number(),
		month: v.number(),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx)

		return ctx.db
			.query('snapshots')
			.withIndex('by_user_month', (q) =>
				q.eq('userId', userId).eq('year', args.year).eq('month', args.month)
			)
			.first()
	},
})

/**
 * Create snapshot for authenticated user.
 * Uses upsert logic - if snapshot for year/month exists, it updates instead.
 */
export const create = mutation({
	args: {
		year: v.number(),
		month: v.number(),
		data: snapshotDataValidator,
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx)

		// Validate year/month
		if (args.year < 2000 || args.year > 2100) {
			throw new ConvexError({ code: 'BAD_REQUEST', message: 'Year must be between 2000 and 2100' })
		}
		if (args.month < 1 || args.month > 12) {
			throw new ConvexError({ code: 'BAD_REQUEST', message: 'Month must be between 1 and 12' })
		}

		// Check for existing snapshot (upsert behavior)
		const existing = await ctx.db
			.query('snapshots')
			.withIndex('by_user_month', (q) =>
				q.eq('userId', userId).eq('year', args.year).eq('month', args.month)
			)
			.first()

		if (existing) {
			await ctx.db.patch(existing._id, { data: args.data })
			return existing._id
		}

		return ctx.db.insert('snapshots', {
			userId,
			year: args.year,
			month: args.month,
			data: args.data,
		})
	},
})

/**
 * Update snapshot (validates ownership).
 */
export const update = mutation({
	args: {
		id: v.id('snapshots'),
		data: snapshotDataValidator,
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx)

		const snapshot = await ctx.db.get(args.id)
		if (!snapshot || snapshot.userId !== userId) {
			throw new ConvexError({ code: 'NOT_FOUND', message: 'Snapshot not found' })
		}

		await ctx.db.patch(args.id, { data: args.data })
		return { success: true }
	},
})

/**
 * Delete snapshot (validates ownership).
 */
export const remove = mutation({
	args: { id: v.id('snapshots') },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx)

		const snapshot = await ctx.db.get(args.id)
		if (!snapshot || snapshot.userId !== userId) {
			throw new ConvexError({ code: 'NOT_FOUND', message: 'Snapshot not found' })
		}

		await ctx.db.delete(args.id)
		return { success: true }
	},
})
