import type { Doc } from '../_generated/dataModel'

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly'

/**
 * Convert any period amount to monthly equivalent.
 * Formulas: daily×30.44, weekly×4.35, monthly×1, yearly÷12
 * All amounts are in cents (integers).
 */
export function toMonthlyAmount(amount: number, period: Period): number {
	switch (period) {
		case 'daily':
			return Math.round(amount * 30.44)
		case 'weekly':
			return Math.round(amount * 4.35)
		case 'monthly':
			return amount
		case 'yearly':
			return Math.round(amount / 12)
		default:
			return amount
	}
}

/**
 * Check if a one-time date falls within a given month.
 */
export function isInMonth(dateStr: string, year: number, month: number): boolean {
	const d = new Date(dateStr)
	return d.getFullYear() === year && d.getMonth() + 1 === month
}

/**
 * Check if recurring item is active during the given month.
 * Returns true if the item's date range overlaps with the month.
 */
export function isActiveInMonth(
	startDate: string | null | undefined,
	endDate: string | null | undefined,
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

/**
 * Calculate single expense's monthly impact for a given month.
 * Handles both one_time and recurring expenses.
 * Returns amount in cents.
 */
export function getExpenseMonthlyAmount(
	expense: Doc<'expenses'>,
	year: number,
	month: number
): number {
	if (expense.type === 'one_time') {
		if (expense.targetDate && isInMonth(expense.targetDate, year, month)) {
			return expense.amount
		}
		return 0
	}
	// recurring
	if (expense.period && isActiveInMonth(expense.startDate, expense.endDate, year, month)) {
		return toMonthlyAmount(expense.amount, expense.period)
	}
	return 0
}

/**
 * Calculate single income's monthly impact for a given month.
 * Returns amount in cents.
 */
export function getIncomeMonthlyAmount(
	income: Doc<'incomes'>,
	year: number,
	month: number
): number {
	if (!isActiveInMonth(income.startDate, income.endDate, year, month)) {
		return 0
	}
	return toMonthlyAmount(income.amount, income.period)
}
