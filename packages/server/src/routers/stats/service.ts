import { db } from '@repo/db'
import { expenses, tags } from '@repo/db/schemas'
import type { ExpensePeriod, User } from '@repo/db/types'
import { and, eq, isNull } from 'drizzle-orm'

const PERIOD_TO_MONTHLY: Record<ExpensePeriod, number> = {
	daily: 30.44,
	weekly: 4.35,
	monthly: 1,
	yearly: 1 / 12,
}

function toMonthlyAmount(amount: number, period: ExpensePeriod) {
	return amount * PERIOD_TO_MONTHLY[period]
}

function isInMonth(dateStr: string, year: number, month: number) {
	const d = new Date(dateStr)
	return d.getFullYear() === year && d.getMonth() + 1 === month
}

function isActiveInMonth(
	startDate: string | null,
	endDate: string | null,
	year: number,
	month: number
) {
	const monthStart = new Date(year, month - 1, 1)
	const monthEnd = new Date(year, month, 0)

	if (startDate && new Date(startDate) > monthEnd) return false
	if (endDate && new Date(endDate) < monthStart) return false

	return true
}

type ExpenseWithTag = {
	type: 'one_time' | 'recurring'
	amount: string
	period: ExpensePeriod | null
	startDate: string | null
	endDate: string | null
	targetDate: string | null
	tagId: string | null
	tagName?: string | null
	tagColor?: string | null
}

function getExpenseMonthlyAmount(exp: ExpenseWithTag, year: number, month: number) {
	if (exp.type === 'one_time') {
		return exp.targetDate && isInMonth(exp.targetDate, year, month) ? Number(exp.amount) : 0
	}

	if (!exp.period || !isActiveInMonth(exp.startDate, exp.endDate, year, month)) {
		return 0
	}

	return toMonthlyAmount(Number(exp.amount), exp.period)
}

type TagAggregate = {
	tagId: string | null
	tagName: string | null
	tagColor: string | null
	total: number
}

const personalExpenseFilter = (userId: User['id']) =>
	and(eq(expenses.userId, userId), isNull(expenses.householdId), eq(expenses.active, true))

export const StatsService = {
	getExpensesByTag: async (userId: User['id'], year: number, month: number) => {
		const userExpenses = await db
			.select({
				tagId: expenses.tagId,
				tagName: tags.name,
				tagColor: tags.color,
				type: expenses.type,
				amount: expenses.amount,
				period: expenses.period,
				startDate: expenses.startDate,
				endDate: expenses.endDate,
				targetDate: expenses.targetDate,
			})
			.from(expenses)
			.leftJoin(tags, eq(expenses.tagId, tags.id))
			.where(personalExpenseFilter(userId))

		const byTag = new Map<string | null, TagAggregate>()

		for (const exp of userExpenses) {
			const amount = getExpenseMonthlyAmount(exp, year, month)
			if (amount === 0) continue

			const existing = byTag.get(exp.tagId)
			if (existing) {
				existing.total += amount
			} else {
				byTag.set(exp.tagId, {
					tagId: exp.tagId,
					tagName: exp.tagName,
					tagColor: exp.tagColor,
					total: amount,
				})
			}
		}

		return Array.from(byTag.values()).sort((a, b) => b.total - a.total)
	},

	getMonthlyTrend: async (userId: User['id'], monthsBack = 6) => {
		const now = new Date()

		const userExpenses = await db
			.select({
				type: expenses.type,
				amount: expenses.amount,
				period: expenses.period,
				startDate: expenses.startDate,
				endDate: expenses.endDate,
				targetDate: expenses.targetDate,
				tagId: expenses.tagId,
			})
			.from(expenses)
			.where(personalExpenseFilter(userId))

		const results: Array<{ year: number; month: number; total: number }> = []
		for (let i = monthsBack - 1; i >= 0; i--) {
			const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
			const year = date.getFullYear()
			const month = date.getMonth() + 1

			const total = userExpenses.reduce(
				(sum, exp) => sum + getExpenseMonthlyAmount(exp, year, month),
				0
			)
			results.push({ year, month, total })
		}

		return results
	},
}
