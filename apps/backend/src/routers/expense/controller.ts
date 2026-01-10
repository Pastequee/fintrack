import { expenseInsertSchema, expenseUpdateSchema } from '@repo/db/types'
import { Elysia } from 'elysia'
import z from 'zod'
import { betterAuth } from '#middlewares/auth'
import { ExpensesService } from './service'

// Validation: one_time requires targetDate, recurring requires period + startDate
const isValidExpenseType = (data: {
	type: 'one_time' | 'recurring'
	targetDate?: string | null
	period?: string | null
	startDate?: string | null
}) => {
	if (data.type === 'one_time') return !!data.targetDate
	return !!data.period && !!data.startDate
}

const validatedExpenseInsert = expenseInsertSchema.refine(isValidExpenseType, {
	message: 'one_time requires targetDate, recurring requires period and startDate',
})

export const expensesRouter = new Elysia({ name: 'expenses', tags: ['Expense'] })
	.use(betterAuth)
	.model('uuidParam', z.object({ id: z.uuidv7() }))

	.get('/expenses', ({ user }) => ExpensesService.getUserExpenses(user.id), {
		auth: true,
	})

	.post(
		'/expenses',
		async ({ body, status, user }) => {
			const createdExpense = await ExpensesService.createExpense({ userId: user.id, ...body })

			return status('Created', createdExpense)
		},
		{ auth: true, body: validatedExpenseInsert }
	)

	.patch(
		'/expenses/:id',
		async ({ body, params, status, user }) => {
			const expense = await ExpensesService.getExpense(params.id)

			if (!expense) return status('Not Found')
			if (expense.userId !== user.id) return status('Forbidden')

			const emptyBody = !(
				body.name ||
				body.amount ||
				body.type ||
				body.period ||
				body.startDate ||
				body.endDate ||
				body.targetDate ||
				body.active !== undefined
			)
			if (emptyBody) return expense

			// Validate merged state for type-specific constraints
			const merged = { ...expense, ...body }
			if (!isValidExpenseType(merged)) {
				return status('Bad Request', {
					message: 'one_time requires targetDate, recurring requires period and startDate',
				})
			}

			const updatedExpense = await ExpensesService.updateExpense(params.id, body)

			return status('OK', updatedExpense)
		},
		{ auth: true, body: expenseUpdateSchema, params: 'uuidParam' }
	)

	.delete(
		'/expenses/:id',
		async ({ params, status, user }) => {
			const expense = await ExpensesService.getExpense(params.id)

			if (!expense) return status('Not Found')
			if (expense.userId !== user.id) return status('Forbidden')

			await ExpensesService.deleteExpense(params.id)

			return status('No Content')
		},
		{ auth: true, params: 'uuidParam' }
	)
