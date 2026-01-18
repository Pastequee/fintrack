import { db } from '@repo/db'
import { expenses } from '@repo/db/schemas'
import type { Expense, ExpensePeriod, IncomePeriod, MonthlyBalance, User } from '@repo/db/types'
import { and, eq, isNull } from 'drizzle-orm'
import { HouseholdsService } from '#routers/household/service'

// Convert any period amount to monthly equivalent
function toMonthlyAmount(amount: number, period: IncomePeriod | ExpensePeriod) {
	switch (period) {
		case 'daily':
			return amount * 30.44 // avg days/month
		case 'weekly':
			return amount * 4.35 // avg weeks/month
		case 'monthly':
			return amount
		case 'yearly':
			return amount / 12
		default:
			return amount
	}
}

// Check if a date falls within a given month
function isInMonth(dateStr: string, year: number, month: number) {
	const d = new Date(dateStr)
	return d.getFullYear() === year && d.getMonth() + 1 === month
}

// Check if recurring item is active during the given month
function isActiveInMonth(
	startDate: string | null,
	endDate: string | null,
	year: number,
	month: number
) {
	const monthStart = new Date(year, month - 1, 1)
	const monthEnd = new Date(year, month, 0) // last day of month

	if (startDate) {
		const start = new Date(startDate)
		if (start > monthEnd) return false
	}

	if (endDate) {
		const end = new Date(endDate)
		if (end < monthStart) return false
	}

	return true
}

// Calculate expense monthly amount (handles both one_time and recurring)
function getExpenseMonthlyAmount(exp: Expense, year: number, month: number) {
	if (exp.type === 'one_time') {
		if (exp.targetDate && isInMonth(exp.targetDate, year, month)) {
			return Number(exp.amount)
		}
		return 0
	}
	if (exp.period && isActiveInMonth(exp.startDate, exp.endDate, year, month)) {
		return toMonthlyAmount(Number(exp.amount), exp.period)
	}
	return 0
}

// Calculate monthly income total for a user
async function calcMonthlyIncome(userId: User['id'], year: number, month: number) {
	const userIncomes = await db.query.incomes.findMany({ where: { userId } })

	return userIncomes.reduce((sum, inc) => {
		if (!isActiveInMonth(inc.startDate, inc.endDate, year, month)) return sum
		return sum + toMonthlyAmount(Number(inc.amount), inc.period)
	}, 0)
}

// Calculate personal expenses total for a user in a month
async function calcPersonalExpenses(userId: User['id'], year: number, month: number) {
	const userExpenses = await db
		.select()
		.from(expenses)
		.where(
			and(eq(expenses.userId, userId), isNull(expenses.householdId), eq(expenses.active, true))
		)

	const items = userExpenses
		.map((exp) => ({
			name: exp.name,
			amount: getExpenseMonthlyAmount(exp, year, month),
			type: exp.type,
			endDate: exp.endDate,
		}))
		.filter((item) => item.amount > 0)

	const total = items.reduce((sum, item) => sum + item.amount, 0)

	return { total, items }
}

// Calculate user's share ratio based on split mode
async function calcUserShareRatio(
	household: { splitMode: string; members: Array<{ userId: string }> },
	userId: User['id'],
	year: number,
	month: number
) {
	const memberCount = household.members.length
	if (memberCount === 0) return 0

	if (household.splitMode === 'equal') {
		return 1 / memberCount
	}

	// income_proportional
	const memberIncomes = await Promise.all(
		household.members.map(async (m) => ({
			userId: m.userId,
			income: await calcMonthlyIncome(m.userId, year, month),
		}))
	)

	const totalIncome = memberIncomes.reduce((sum, m) => sum + m.income, 0)
	if (totalIncome === 0) return 1 / memberCount

	const userIncome = memberIncomes.find((m) => m.userId === userId)?.income ?? 0
	return userIncome / totalIncome
}

// Calculate household expense share for a user
async function calcHouseholdShare(userId: User['id'], year: number, month: number) {
	const membership = await HouseholdsService.getUserMembership(userId)
	if (!membership) return { total: 0, items: [] }

	const household = await HouseholdsService.getHouseholdWithMembers(membership.householdId)
	if (!household) return { total: 0, items: [] }

	const householdExpenses = await db.query.expenses.findMany({
		where: { householdId: membership.householdId, active: true },
	})

	const userShare = await calcUserShareRatio(household, userId, year, month)

	const items = householdExpenses
		.map((exp) => {
			const amount = getExpenseMonthlyAmount(exp, year, month)
			return { name: exp.name, amount, yourShare: amount * userShare }
		})
		.filter((item) => item.amount > 0)

	const total = items.reduce((sum, item) => sum + item.yourShare, 0)

	return { total, items }
}

export const BalanceService = {
	getMonthlyBalance: async (userId: User['id'], year: number, month: number) => {
		const [income, personalExpenses, householdShare] = await Promise.all([
			calcMonthlyIncome(userId, year, month),
			calcPersonalExpenses(userId, year, month),
			calcHouseholdShare(userId, year, month),
		])

		return {
			year,
			month,
			income,
			personalExpenses,
			householdShare,
			remaining: income - personalExpenses.total - householdShare.total,
		} satisfies MonthlyBalance
	},

	// Project balances for N months starting from a given month
	getProjection: async (
		userId: User['id'],
		startYear: number,
		startMonth: number,
		monthsAhead: number
	) => {
		const projections: MonthlyBalance[] = []
		let year = startYear
		let month = startMonth

		for (let i = 0; i < monthsAhead; i++) {
			const balance = await BalanceService.getMonthlyBalance(userId, year, month)
			projections.push(balance)

			// Advance to next month
			month++
			if (month > 12) {
				month = 1
				year++
			}
		}

		return projections
	},
}
