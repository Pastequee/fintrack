import { boolean, date, numeric, pgEnum, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from '../schema-utils'
import { users } from './auth'

export const expenseType = pgEnum('expense_type', ['one_time', 'recurring'])
export const expensePeriod = pgEnum('expense_period', ['daily', 'weekly', 'monthly', 'yearly'])

export const expenses = pgTable('expenses', {
	id,

	userId: uuid('user_id')
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),

	householdId: uuid('household_id'), // nullable, for future household expenses

	name: text().notNull(),
	amount: numeric({ precision: 12, scale: 2 }).notNull(),
	type: expenseType().notNull(),
	period: expensePeriod(), // required for recurring, null for one_time
	startDate: date(), // required for recurring
	endDate: date(), // optional, for recurring expenses with end date
	targetDate: date(), // required for one_time expenses

	active: boolean().notNull().default(true), // for household member departure handling

	...timestamps,
})
