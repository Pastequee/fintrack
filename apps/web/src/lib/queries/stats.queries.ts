import { eden, edenQueryOption } from '~/lib/clients/eden-client'
import { keys } from './keys'

export const expensesByTagOptions = (year: number, month: number) =>
	edenQueryOption({
		edenQuery: eden.stats['expenses-by-tag'].get,
		edenOptions: { query: { year, month } },
		queryKey: keys.stats.byTag(year, month),
	})

export const monthlyTrendOptions = (monthsBack = 6) =>
	edenQueryOption({
		edenQuery: eden.stats['monthly-trend'].get,
		edenOptions: { query: { monthsBack } },
		queryKey: keys.stats.trend(monthsBack),
	})
