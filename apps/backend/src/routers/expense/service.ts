import { db } from '@repo/db'
import { expenses } from '@repo/db/schemas'
import type { Expense, ExpenseInsert, ExpenseUpdate, Household, User } from '@repo/db/types'
import { and, eq, isNull } from 'drizzle-orm'

export const ExpensesService = {
	getUserExpenses: async (userId: User['id']) =>
		db
			.select()
			.from(expenses)
			.where(and(eq(expenses.userId, userId), isNull(expenses.householdId))),

	getHouseholdExpenses: async (householdId: Household['id']) =>
		db.query.expenses.findMany({
			where: { householdId },
			orderBy: { createdAt: 'desc' },
		}),

	getExpense: async (id: Expense['id']) =>
		db.query.expenses.findFirst({
			where: { id },
		}),

	createExpense: async (data: ExpenseInsert) =>
		db
			.insert(expenses)
			.values(data)
			.returning()
			// biome-ignore lint/style/noNonNullAssertion: always returns an expense
			.then(([expense]) => expense!),

	updateExpense: async (id: Expense['id'], data: ExpenseUpdate) =>
		db
			.update(expenses)
			.set(data)
			.where(eq(expenses.id, id))
			.returning()
			// biome-ignore lint/style/noNonNullAssertion: always returns an expense
			.then(([expense]) => expense!),

	deleteExpense: async (id: Expense['id']) => {
		await db.delete(expenses).where(eq(expenses.id, id))
	},
}
