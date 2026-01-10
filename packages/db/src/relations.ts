import { defineRelations } from 'drizzle-orm'
import * as schema from './schemas'

export const relations = defineRelations(schema, (r) => ({
	users: {
		sessions: r.many.sessions(),
		accounts: r.many.accounts(),
		todos: r.many.todos(),
		incomes: r.many.incomes(),
		expenses: r.many.expenses(),
		pockets: r.many.pockets(),
	},

	sessions: {
		user: r.one.users({
			from: r.sessions.userId,
			to: r.users.id,
		}),
	},

	accounts: {
		user: r.one.users({
			from: r.accounts.userId,
			to: r.users.id,
		}),
	},

	todos: {
		user: r.one.users({
			from: r.todos.userId,
			to: r.users.id,
		}),
	},

	incomes: {
		user: r.one.users({
			from: r.incomes.userId,
			to: r.users.id,
		}),
	},

	expenses: {
		user: r.one.users({
			from: r.expenses.userId,
			to: r.users.id,
		}),
	},

	pockets: {
		user: r.one.users({
			from: r.pockets.userId,
			to: r.users.id,
		}),
	},
}))
