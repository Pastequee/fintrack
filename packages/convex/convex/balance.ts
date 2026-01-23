import { v } from 'convex/values'
import type { Id } from './_generated/dataModel'
import type { QueryCtx } from './_generated/server'
import { query } from './_generated/server'
import { requireAuth } from './lib/auth'
import { getExpenseMonthlyAmount, getIncomeMonthlyAmount } from './lib/balance'

/**
 * Get user's household membership.
 */
function getUserMembership(ctx: QueryCtx, userId: Id<'users'>) {
	return ctx.db
		.query('householdMembers')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.first()
}

/**
 * Calculate total monthly income for a user in a given month.
 */
async function calcMonthlyIncome(ctx: QueryCtx, userId: Id<'users'>, year: number, month: number) {
	const incomes = await ctx.db
		.query('incomes')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.collect()

	return incomes.reduce((sum, inc) => sum + getIncomeMonthlyAmount(inc, year, month), 0)
}

/**
 * Calculate personal expenses (no household) for user in a month.
 * Returns total and items array.
 */
async function calcPersonalExpenses(
	ctx: QueryCtx,
	userId: Id<'users'>,
	year: number,
	month: number
) {
	const expenses = await ctx.db
		.query('expenses')
		.withIndex('by_user', (q) => q.eq('userId', userId))
		.filter((q) => q.and(q.eq(q.field('householdId'), undefined), q.eq(q.field('active'), true)))
		.collect()

	const items = expenses
		.map((exp) => ({
			id: exp._id,
			name: exp.name,
			amount: getExpenseMonthlyAmount(exp, year, month),
		}))
		.filter((item) => item.amount > 0)

	const total = items.reduce((sum, item) => sum + item.amount, 0)

	return { total, items }
}

/**
 * Calculate user's share ratio based on household split mode.
 * Equal: 1/members
 * Income proportional: userIncome/totalMembersIncome
 */
async function calcUserShareRatio(
	ctx: QueryCtx,
	household: { splitMode: 'equal' | 'income_proportional' },
	memberUserIds: Id<'users'>[],
	userId: Id<'users'>,
	year: number,
	month: number
) {
	const memberCount = memberUserIds.length
	if (memberCount === 0) return 0

	if (household.splitMode === 'equal') {
		return 1 / memberCount
	}

	// income_proportional
	const memberIncomes = await Promise.all(
		memberUserIds.map(async (memberId) => ({
			userId: memberId,
			income: await calcMonthlyIncome(ctx, memberId, year, month),
		}))
	)

	const totalIncome = memberIncomes.reduce((sum, m) => sum + m.income, 0)
	if (totalIncome === 0) return 1 / memberCount

	const userIncome = memberIncomes.find((m) => m.userId === userId)?.income ?? 0
	return userIncome / totalIncome
}

/**
 * Calculate household expense share for a user.
 * Returns total (user's share) and items array with amount and yourShare.
 */
async function calcHouseholdShare(ctx: QueryCtx, userId: Id<'users'>, year: number, month: number) {
	const membership = await getUserMembership(ctx, userId)
	if (!membership) return { total: 0, items: [] }

	const household = await ctx.db.get(membership.householdId)
	if (!household) return { total: 0, items: [] }

	// Get all household members
	const members = await ctx.db
		.query('householdMembers')
		.withIndex('by_household', (q) => q.eq('householdId', membership.householdId))
		.collect()

	const memberUserIds = members.map((m) => m.userId)

	// Get household expenses
	const expenses = await ctx.db
		.query('expenses')
		.withIndex('by_household', (q) => q.eq('householdId', membership.householdId))
		.filter((q) => q.eq(q.field('active'), true))
		.collect()

	const userShare = await calcUserShareRatio(ctx, household, memberUserIds, userId, year, month)

	const items = expenses
		.map((exp) => {
			const amount = getExpenseMonthlyAmount(exp, year, month)
			return {
				id: exp._id,
				name: exp.name,
				amount,
				yourShare: Math.round(amount * userShare),
			}
		})
		.filter((item) => item.amount > 0)

	const total = items.reduce((sum, item) => sum + item.yourShare, 0)

	return { total, items }
}

/**
 * Get monthly balance for authenticated user.
 * Calculates income, personal expenses, household share, and remaining.
 */
export const monthly = query({
	args: {
		year: v.number(),
		month: v.number(),
	},
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx)

		// Validate year/month
		if (args.year < 2000 || args.year > 2100) {
			throw new Error('Year must be between 2000 and 2100')
		}
		if (args.month < 1 || args.month > 12) {
			throw new Error('Month must be between 1 and 12')
		}

		const [income, personalExpenses, householdShare] = await Promise.all([
			calcMonthlyIncome(ctx, userId, args.year, args.month),
			calcPersonalExpenses(ctx, userId, args.year, args.month),
			calcHouseholdShare(ctx, userId, args.year, args.month),
		])

		return {
			year: args.year,
			month: args.month,
			income,
			personalExpenses,
			householdShare,
			remaining: income - personalExpenses.total - householdShare.total,
		}
	},
})
