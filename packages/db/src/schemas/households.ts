import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from '../schema-utils'
import { users } from './auth'

export const splitMode = pgEnum('split_mode', ['equal', 'income_proportional'])

export const households = pgTable('households', {
	id,

	name: text().notNull(),

	splitMode: splitMode().notNull().default('equal'),

	...timestamps,
})

export const householdMembers = pgTable('household_members', {
	id,

	householdId: uuid('household_id')
		.references(() => households.id, { onDelete: 'cascade' })
		.notNull(),

	userId: uuid('user_id')
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),

	joinedAt: timestamp().notNull().defaultNow(),
})
