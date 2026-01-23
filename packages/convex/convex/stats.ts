import { v } from 'convex/values'
import { query } from './_generated/server'
import { requireAuth } from './lib/auth'
import { getExpenseMonthlyAmount } from './lib/balance'

/**
 * Aggregate personal expenses by tag for a given month.
 * Returns array sorted by total desc, includes tag color.
 * Expenses without tags are grouped as "Uncategorized".
 */
export const expensesByTag = query({
	args: {
		year: v.number(),
		month: v.number(),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx)

		if (args.year < 2000 || args.year > 2100) {
			throw new Error('Year must be between 2000 and 2100')
		}
		if (args.month < 1 || args.month > 12) {
			throw new Error('Month must be between 1 and 12')
		}

		// Get personal expenses (no household)
		const expenses = await ctx.db
			.query('expenses')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.filter((q) => q.and(q.eq(q.field('householdId'), undefined), q.eq(q.field('active'), true)))
			.collect()

		// Get user's tags for lookup
		const tags = await ctx.db
			.query('tags')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.collect()

		const tagMap = new Map(tags.map((t) => [t._id, { name: t.name, color: t.color }]))

		// Aggregate by tag
		const aggregated = new Map<
			string,
			{ tagId: string | null; name: string; color: string | null; total: number }
		>()

		for (const expense of expenses) {
			const amount = getExpenseMonthlyAmount(expense, args.year, args.month)
			if (amount === 0) continue

			const tagId = expense.tagId ?? null
			const key = tagId ?? 'uncategorized'

			if (!aggregated.has(key)) {
				const tag = tagId ? tagMap.get(tagId) : null
				aggregated.set(key, {
					tagId,
					name: tag?.name ?? 'Uncategorized',
					color: tag?.color ?? null,
					total: 0,
				})
			}

			const entry = aggregated.get(key)
			if (entry) entry.total += amount
		}

		// Sort by total desc
		return Array.from(aggregated.values()).sort((a, b) => b.total - a.total)
	},
})

/**
 * Get expense totals for the last N months.
 * Returns array of { year, month, total } sorted chronologically.
 */
export const monthlyTrend = query({
	args: {
		monthsBack: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx)

		const monthsBack = args.monthsBack ?? 6
		if (monthsBack < 1 || monthsBack > 24) {
			throw new Error('monthsBack must be between 1 and 24')
		}

		// Get personal expenses (no household)
		const expenses = await ctx.db
			.query('expenses')
			.withIndex('by_user', (q) => q.eq('userId', userId))
			.filter((q) => q.and(q.eq(q.field('householdId'), undefined), q.eq(q.field('active'), true)))
			.collect()

		const now = new Date()
		const currentYear = now.getFullYear()
		const currentMonth = now.getMonth() + 1

		const result: { year: number; month: number; total: number }[] = []

		for (let i = monthsBack - 1; i >= 0; i--) {
			let year = currentYear
			let month = currentMonth - i

			// Handle year rollover
			while (month < 1) {
				month += 12
				year -= 1
			}

			const total = expenses.reduce(
				(sum, exp) => sum + getExpenseMonthlyAmount(exp, year, month),
				0
			)

			result.push({ year, month, total })
		}

		return result
	},
})
