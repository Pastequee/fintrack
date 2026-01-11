import { db } from '@repo/db'
import { expenses } from '@repo/db/schemas'
import type { Expense, ExpensePeriod, IncomePeriod, User } from '@repo/db/types'
import { and, eq, isNull } from 'drizzle-orm'
import { HouseholdsService } from '#routers/household/service'

// Convert any period amount to monthly equivalent
function toMonthlyAmount(amount: number, period: IncomePeriod | ExpensePeriod): number {
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
function isInMonth(dateStr: string, year: number, month: number): boolean {
	const d = new Date(dateStr)
	return d.getFullYear() === year && d.getMonth() + 1 === month
}

// Check if recurring item is active during the given month
function isActiveInMonth(
	startDate: string | null,
	endDate: string | null,
	year: number,
	month: number
): boolean {
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
function getExpenseMonthlyAmount(exp: Expense, year: number, month: number): number {
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
async function calcMonthlyIncome(userId: User['id'], year: number, month: number): Promise<number> {
	const userIncomes = await db.query.incomes.findMany({ where: { userId } })

	return userIncomes.reduce((sum, inc) => {
		if (!isActiveInMonth(inc.startDate, inc.endDate, year, month)) return sum
		return sum + toMonthlyAmount(Number(inc.amount), inc.period)
	}, 0)
}

// Calculate personal expenses total for a user in a month
async function calcPersonalExpenses(
	userId: User['id'],
	year: number,
	month: number
): Promise<{ total: number; items: Array<{ name: string; amount: number; type: string }> }> {
	const userExpenses = await db
		.select()
		.from(expenses)
		.where(
			and(eq(expenses.userId, userId), isNull(expenses.householdId), eq(expenses.active, true))
		)

	const items: Array<{ name: string; amount: number; type: string }> = []
	let total = 0

	for (const exp of userExpenses) {
		const amt = getExpenseMonthlyAmount(exp, year, month)
		if (amt > 0) {
			items.push({ name: exp.name, amount: amt, type: exp.type })
			total += amt
		}
	}

	return { total, items }
}

// Calculate user's share ratio based on split mode
async function calcUserShareRatio(
	household: { splitMode: string; members: Array<{ userId: string }> },
	userId: User['id'],
	year: number,
	month: number
): Promise<number> {
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
async function calcHouseholdShare(
	userId: User['id'],
	year: number,
	month: number
): Promise<{ total: number; items: Array<{ name: string; amount: number; yourShare: number }> }> {
	const membership = await HouseholdsService.getUserMembership(userId)
	if (!membership) return { total: 0, items: [] }

	const household = await HouseholdsService.getHouseholdWithMembers(membership.householdId)
	if (!household) return { total: 0, items: [] }

	const householdExpenses = await db.query.expenses.findMany({
		where: { householdId: membership.householdId, active: true },
	})

	// Build expense items with monthly amounts
	const expenseItems: Array<{ name: string; amount: number; yourShare: number }> = []
	let totalHouseholdExpense = 0

	for (const exp of householdExpenses) {
		const monthlyAmount = getExpenseMonthlyAmount(exp, year, month)
		if (monthlyAmount > 0) {
			totalHouseholdExpense += monthlyAmount
			expenseItems.push({ name: exp.name, amount: monthlyAmount, yourShare: 0 })
		}
	}

	const userShare = await calcUserShareRatio(household, userId, year, month)

	for (const item of expenseItems) {
		item.yourShare = item.amount * userShare
	}

	return { total: totalHouseholdExpense * userShare, items: expenseItems }
}

// Calculate total pockets sum
async function calcPocketsTotal(
	userId: User['id']
): Promise<{ total: number; items: Array<{ name: string; amount: number }> }> {
	const userPockets = await db.query.pockets.findMany({ where: { userId } })

	const items = userPockets.map((p) => ({
		name: p.name,
		amount: Number(p.amount),
	}))

	const total = items.reduce((sum, p) => sum + p.amount, 0)

	return { total, items }
}

export type MonthlyBalance = {
	year: number
	month: number
	income: number
	personalExpenses: {
		total: number
		items: Array<{ name: string; amount: number; type: string }>
	}
	householdShare: {
		total: number
		items: Array<{ name: string; amount: number; yourShare: number }>
	}
	pockets: {
		total: number
		items: Array<{ name: string; amount: number }>
	}
	remaining: number
}

export const BalanceService = {
	getMonthlyBalance: async (
		userId: User['id'],
		year: number,
		month: number
	): Promise<MonthlyBalance> => {
		const [income, personalExpenses, householdShare, pockets] = await Promise.all([
			calcMonthlyIncome(userId, year, month),
			calcPersonalExpenses(userId, year, month),
			calcHouseholdShare(userId, year, month),
			calcPocketsTotal(userId),
		])

		const remaining = income - personalExpenses.total - householdShare.total - pockets.total

		return {
			year,
			month,
			income,
			personalExpenses,
			householdShare,
			pockets,
			remaining,
		}
	},
}
