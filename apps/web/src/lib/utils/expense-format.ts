type ExpenseType = 'one_time' | 'recurring'
type ExpensePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'

export const periodLabels: Record<ExpensePeriod, string> = {
	daily: '/day',
	weekly: '/week',
	monthly: '/mo',
	yearly: '/year',
}

export const formatExpenseAmount = (
	amount: number,
	type: ExpenseType,
	period: ExpensePeriod | undefined
) => {
	const formatted = `€${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
	if (type === 'one_time') return formatted
	return `${formatted}${period ? periodLabels[period] : ''}`
}

export const formatShortDate = (date: string | number) => {
	return new Date(date).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	})
}

export const getRemainingDuration = (endDate: string | number | undefined) => {
	if (!endDate) return null
	const end = new Date(endDate)
	const now = new Date()
	const months = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30))
	if (months <= 0) return 'Ended'
	if (months === 1) return '1 month left'
	return `${months} months left`
}

export const getSplitAmount = (amount: number, memberCount: number) => {
	if (memberCount <= 1) return null
	const split = amount / memberCount
	return `€${split.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} each`
}
