import { Elysia, t } from 'elysia'
import { betterAuth } from '#middlewares/auth'
import { BalanceService } from './service'

export const balanceRouter = new Elysia({ name: 'balance', tags: ['Balance'] })
	.use(betterAuth)

	.get(
		'/balance/:year/:month',
		({ params, user }) => BalanceService.getMonthlyBalance(user.id, params.year, params.month),
		{
			auth: true,
			params: t.Object({
				year: t.Numeric({ minimum: 2000, maximum: 2100 }),
				month: t.Numeric({ minimum: 1, maximum: 12 }),
			}),
		}
	)

	.get(
		'/balance/projection/:year/:month/:months',
		({ params, user }) =>
			BalanceService.getProjection(user.id, params.year, params.month, params.months),
		{
			auth: true,
			params: t.Object({
				year: t.Numeric({ minimum: 2000, maximum: 2100 }),
				month: t.Numeric({ minimum: 1, maximum: 12 }),
				months: t.Numeric({ minimum: 1, maximum: 24 }),
			}),
		}
	)
