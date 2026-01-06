import { incomeInsertSchema, incomeUpdateSchema } from '@repo/db/types'
import { Elysia } from 'elysia'
import z from 'zod'
import { betterAuth } from '#middlewares/auth'
import { IncomesService } from './service'

export const incomesRouter = new Elysia({ name: 'incomes', tags: ['Income'] })
	.use(betterAuth)
	.model('uuidParam', z.object({ id: z.uuidv7() }))

	.get('/incomes', ({ user }) => IncomesService.getUserIncomes(user.id), {
		auth: true,
	})

	.post(
		'/incomes',
		async ({ body, status, user }) => {
			const createdIncome = await IncomesService.createIncome({ userId: user.id, ...body })

			return status('Created', createdIncome)
		},
		{ auth: true, body: incomeInsertSchema }
	)

	.patch(
		'/incomes/:id',
		async ({ body, params, status, user }) => {
			const income = await IncomesService.getIncome(params.id)

			if (!income) return status('Not Found')
			if (income.userId !== user.id) return status('Forbidden')

			const emptyBody = !(body.name || body.amount || body.period || body.startDate || body.endDate)
			if (emptyBody) return income

			const updatedIncome = await IncomesService.updateIncome(params.id, body)

			return status('OK', updatedIncome)
		},
		{ auth: true, body: incomeUpdateSchema, params: 'uuidParam' }
	)

	.delete(
		'/incomes/:id',
		async ({ params, status, user }) => {
			const income = await IncomesService.getIncome(params.id)

			if (!income) return status('Not Found')
			if (income.userId !== user.id) return status('Forbidden')

			await IncomesService.deleteIncome(params.id)

			return status('No Content')
		},
		{ auth: true, params: 'uuidParam' }
	)
