import { db } from '@repo/db'
import { invitations } from '@repo/db/schemas'
import type { Household, Invitation, InvitationInsert } from '@repo/db/types'
import { and, eq, lt } from 'drizzle-orm'

export const InvitationsService = {
	getInvitation: async (id: Invitation['id']) =>
		db.query.invitations.findFirst({
			where: { id },
			with: { household: true, inviter: true },
		}),

	getInvitationByToken: async (token: string) =>
		db.query.invitations.findFirst({
			where: { token },
			with: { household: true, inviter: true },
		}),

	getInvitationByEmail: async (email: string, householdId: Household['id']) =>
		db.query.invitations.findFirst({
			where: { email, householdId },
		}),

	getPendingInvitationsByHousehold: async (householdId: Household['id']) =>
		db.query.invitations.findMany({
			where: { householdId, status: 'pending' },
			with: { inviter: true },
		}),

	getPendingInvitationsForUser: async (email: string) =>
		db.query.invitations.findMany({
			where: { email, status: 'pending' },
			with: { household: true, inviter: true },
		}),

	createInvitation: async (data: InvitationInsert) =>
		db
			.insert(invitations)
			.values(data)
			.returning()
			// biome-ignore lint/style/noNonNullAssertion: always returns
			.then(([inv]) => inv!),

	updateInvitationStatus: async (id: Invitation['id'], status: Invitation['status']) =>
		db
			.update(invitations)
			.set({ status })
			.where(eq(invitations.id, id))
			.returning()
			// biome-ignore lint/style/noNonNullAssertion: always returns
			.then(([inv]) => inv!),

	invalidateExpiredInvitations: async () =>
		db
			.update(invitations)
			.set({ status: 'expired' })
			.where(and(eq(invitations.status, 'pending'), lt(invitations.expiresAt, new Date()))),

	generateToken: () => crypto.randomUUID(),

	getExpirationDate: (daysFromNow = 7) => {
		const date = new Date()
		date.setDate(date.getDate() + daysFromNow)
		return date
	},
}
