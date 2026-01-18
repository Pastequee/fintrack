import type { ExpenseUpdate } from '@repo/db/types'
import { expenseInsertSchema, expenseUpdateSchema } from '@repo/db/types'
import { Elysia } from 'elysia'
import z from 'zod'
import { betterAuth } from '#middlewares/auth'
import { HouseholdsService } from '#routers/household/service'
import { ExpensesService } from './service'

type ExpenseTypeData = {
	type: 'one_time' | 'recurring'
	targetDate?: string | null
	period?: string | null
	startDate?: string | null
}

const TYPE_VALIDATION_MESSAGE =
	'one_time requires targetDate, recurring requires period and startDate'

const isValidExpenseType = (data: ExpenseTypeData) => {
	if (data.type === 'one_time') return !!data.targetDate
	return !!data.period && !!data.startDate
}

const isEmptyUpdate = (body: ExpenseUpdate) =>
	!(
		body.name ||
		body.amount ||
		body.type ||
		body.period ||
		body.startDate ||
		body.endDate ||
		body.targetDate ||
		body.active !== undefined
	)

const validatedExpenseInsert = expenseInsertSchema.refine(isValidExpenseType, {
	message: TYPE_VALIDATION_MESSAGE,
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
			if (isEmptyUpdate(body)) return expense

			const merged = { ...expense, ...body }
			if (!isValidExpenseType(merged)) {
				return status('Bad Request', { message: TYPE_VALIDATION_MESSAGE })
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

	// Household expense endpoints
	.get(
		'/household-expenses',
		async ({ status, user }) => {
			const membership = await HouseholdsService.getUserMembership(user.id)
			if (!membership) return status('Forbidden')

			return ExpensesService.getHouseholdExpenses(membership.householdId)
		},
		{ auth: true }
	)

	.post(
		'/household-expenses',
		async ({ body, status, user }) => {
			const membership = await HouseholdsService.getUserMembership(user.id)
			if (!membership) return status('Forbidden')

			const createdExpense = await ExpensesService.createExpense({
				userId: user.id,
				householdId: membership.householdId,
				...body,
			})

			return status('Created', createdExpense)
		},
		{ auth: true, body: validatedExpenseInsert }
	)

	.patch(
		'/household-expenses/:id',
		async ({ body, params, status, user }) => {
			const membership = await HouseholdsService.getUserMembership(user.id)
			if (!membership) return status('Forbidden')

			const expense = await ExpensesService.getExpense(params.id)
			if (!expense) return status('Not Found')
			if (expense.householdId !== membership.householdId) return status('Forbidden')
			if (isEmptyUpdate(body)) return expense

			const merged = { ...expense, ...body }
			if (!isValidExpenseType(merged)) {
				return status('Bad Request', { message: TYPE_VALIDATION_MESSAGE })
			}

			const updatedExpense = await ExpensesService.updateExpense(params.id, body)

			return status('OK', updatedExpense)
		},
		{ auth: true, body: expenseUpdateSchema, params: 'uuidParam' }
	)

	.delete(
		'/household-expenses/:id',
		async ({ params, status, user }) => {
			const membership = await HouseholdsService.getUserMembership(user.id)
			if (!membership) return status('Forbidden')

			const expense = await ExpensesService.getExpense(params.id)
			if (!expense) return status('Not Found')
			if (expense.householdId !== membership.householdId) return status('Forbidden')

			await ExpensesService.deleteExpense(params.id)

			return status('No Content')
		},
		{ auth: true, params: 'uuidParam' }
	)
