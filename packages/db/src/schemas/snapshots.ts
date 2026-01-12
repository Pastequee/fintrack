import { integer, jsonb, pgTable, unique, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from '../schema-utils'
import { users } from './auth'

export type SnapshotData = {
	income: number
	personalExpenses: {
		total: number
		items: Array<{ name: string; amount: number; type: string; endDate: string | null }>
	}
	householdShare: {
		total: number
		items: Array<{ name: string; amount: number; yourShare: number }>
	}
	remaining: number
}

export type MonthlyBalance = SnapshotData & { year: number; month: number }

export const snapshots = pgTable(
	'snapshots',
	{
		id,

		userId: uuid('user_id')
			.references(() => users.id, { onDelete: 'cascade' })
			.notNull(),

		year: integer().notNull(),
		month: integer().notNull(),
		data: jsonb().$type<SnapshotData>().notNull(),

		...timestamps,
	},
	(t) => [unique().on(t.userId, t.year, t.month)]
)
