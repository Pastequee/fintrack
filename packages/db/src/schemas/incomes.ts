import { date, numeric, pgEnum, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from '../schema-utils'
import { users } from './auth'

export const incomePeriod = pgEnum('income_period', ['daily', 'weekly', 'monthly', 'yearly'])

export const incomes = pgTable('incomes', {
	id,

	userId: uuid('user_id')
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),

	name: text().notNull(),
	amount: numeric({ precision: 12, scale: 2 }).notNull(),
	period: incomePeriod().notNull(),
	startDate: date().notNull(),
	endDate: date(),

	...timestamps,
})
