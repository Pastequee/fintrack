import { defineRelations } from 'drizzle-orm'
import * as schema from './schemas'

export const relations = defineRelations(schema, (r) => ({
	users: {
		sessions: r.many.sessions(),
		accounts: r.many.accounts(),
		incomes: r.many.incomes(),
		expenses: r.many.expenses(),
		pockets: r.many.pockets(),
		householdMemberships: r.many.householdMembers(),
		snapshots: r.many.snapshots(),
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
		household: r.one.households({
			from: r.expenses.householdId,
			to: r.households.id,
		}),
	},

	pockets: {
		user: r.one.users({
			from: r.pockets.userId,
			to: r.users.id,
		}),
	},

	households: {
		members: r.many.householdMembers(),
		expenses: r.many.expenses(),
		invitations: r.many.invitations(),
	},

	invitations: {
		household: r.one.households({
			from: r.invitations.householdId,
			to: r.households.id,
		}),
		inviter: r.one.users({
			from: r.invitations.invitedBy,
			to: r.users.id,
		}),
	},

	householdMembers: {
		household: r.one.households({
			from: r.householdMembers.householdId,
			to: r.households.id,
		}),
		user: r.one.users({
			from: r.householdMembers.userId,
			to: r.users.id,
		}),
	},

	snapshots: {
		user: r.one.users({
			from: r.snapshots.userId,
			to: r.users.id,
		}),
	},
}))
