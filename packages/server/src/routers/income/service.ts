import { db } from '@repo/db'
import { incomes } from '@repo/db/schemas'
import type { Income, IncomeInsert, IncomeUpdate, User } from '@repo/db/types'
import { eq } from 'drizzle-orm'

export const IncomesService = {
	getUserIncomes: async (userId: User['id']) =>
		db.query.incomes.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
		}),

	getIncome: async (id: Income['id']) =>
		db.query.incomes.findFirst({
			where: { id },
		}),

	createIncome: async (data: IncomeInsert) =>
		db
			.insert(incomes)
			.values(data)
			.returning()
			// biome-ignore lint/style/noNonNullAssertion: always returns an income
			.then(([income]) => income!),

	updateIncome: async (id: Income['id'], data: IncomeUpdate) =>
		db
			.update(incomes)
			.set(data)
			.where(eq(incomes.id, id))
			.returning()
			// biome-ignore lint/style/noNonNullAssertion: always returns an income
			.then(([income]) => income!),

	deleteIncome: async (id: Income['id']) => {
		await db.delete(incomes).where(eq(incomes.id, id))
	},
}
