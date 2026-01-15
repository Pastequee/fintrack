type DateInput = Date | string

const toDate = (date: DateInput) => (typeof date === 'string' ? new Date(date) : date)

const fullDateFormatter = new Intl.DateTimeFormat('fr-FR', {
	day: 'numeric',
	month: 'long',
	year: 'numeric',
})

const shortDateFormatter = new Intl.DateTimeFormat('fr-FR', {
	day: 'numeric',
	month: 'short',
	year: 'numeric',
})

const monthYearFormatter = new Intl.DateTimeFormat('fr-FR', {
	month: 'long',
	year: 'numeric',
})

const monthFormatter = new Intl.DateTimeFormat('fr-FR', {
	month: 'long',
})

export const formatDate = (date: DateInput) => fullDateFormatter.format(toDate(date))

export const formatDateShort = (date: DateInput) => shortDateFormatter.format(toDate(date))

export const formatMonthYear = (date: DateInput) => monthYearFormatter.format(toDate(date))

export const formatMonth = (date: DateInput) => monthFormatter.format(toDate(date))
