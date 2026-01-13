import { pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from '../schema-utils'
import { users } from './auth'

export const tags = pgTable('tags', {
	id,

	userId: uuid('user_id')
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),

	name: text().notNull(),
	color: text().notNull(), // hex color e.g. "#ef4444"

	...timestamps,
})
