import { numeric, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from '../schema-utils'
import { users } from './auth'

export const pockets = pgTable('pockets', {
	id,

	userId: uuid('user_id')
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),

	name: text().notNull(),
	amount: numeric({ precision: 12, scale: 2 }).notNull(),

	...timestamps,
})
