import { Elysia, t } from 'elysia'
import { betterAuth } from '#middlewares/auth'
import { StatsService } from './service'

export const statsRouter = new Elysia({ name: 'stats', tags: ['Stats'] })
	.use(betterAuth)

	.get(
		'/stats/expenses-by-tag',
		({ query, user }) => {
			const now = new Date()
			const year = query.year ?? now.getFullYear()
			const month = query.month ?? now.getMonth() + 1
			return StatsService.getExpensesByTag(user.id, year, month)
		},
		{
			auth: true,
			query: t.Object({
				year: t.Optional(t.Number()),
				month: t.Optional(t.Number()),
			}),
		}
	)

	.get(
		'/stats/monthly-trend',
		({ query, user }) => {
			const monthsBack = query.monthsBack ?? 6
			return StatsService.getMonthlyTrend(user.id, monthsBack)
		},
		{
			auth: true,
			query: t.Object({
				monthsBack: t.Optional(t.Number()),
			}),
		}
	)
