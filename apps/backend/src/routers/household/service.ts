import { db } from '@repo/db'
import { expenses, householdMembers, households } from '@repo/db/schemas'
import type {
	Household,
	HouseholdInsert,
	HouseholdMemberInsert,
	HouseholdUpdate,
	User,
} from '@repo/db/types'
import { and, eq } from 'drizzle-orm'

export const HouseholdsService = {
	getHousehold: async (id: Household['id']) =>
		db.query.households.findFirst({
			where: { id },
		}),

	getHouseholdWithMembers: async (id: Household['id']) =>
		db.query.households.findFirst({
			where: { id },
			with: {
				members: {
					with: { user: true },
				},
			},
		}),

	getUserHousehold: async (userId: User['id']) => {
		const membership = await db.query.householdMembers.findFirst({
			where: { userId },
			with: {
				household: {
					with: {
						members: {
							with: { user: true },
						},
					},
				},
			},
		})
		return membership?.household ?? null
	},

	getUserMembership: async (userId: User['id']) =>
		db.query.householdMembers.findFirst({
			where: { userId },
		}),

	createHousehold: async (data: HouseholdInsert) =>
		db
			.insert(households)
			.values(data)
			.returning()
			// biome-ignore lint/style/noNonNullAssertion: always returns
			.then(([h]) => h!),

	addMember: async (data: HouseholdMemberInsert) =>
		db
			.insert(householdMembers)
			.values(data)
			.returning()
			// biome-ignore lint/style/noNonNullAssertion: always returns
			.then(([m]) => m!),

	removeMember: async (householdId: Household['id'], userId: User['id']) => {
		await db
			.delete(householdMembers)
			.where(
				and(eq(householdMembers.householdId, householdId), eq(householdMembers.userId, userId))
			)
	},

	updateHousehold: async (id: Household['id'], data: HouseholdUpdate) =>
		db
			.update(households)
			.set(data)
			.where(eq(households.id, id))
			.returning()
			// biome-ignore lint/style/noNonNullAssertion: always returns
			.then(([h]) => h!),

	deleteHousehold: async (id: Household['id']) => {
		await db.delete(households).where(eq(households.id, id))
	},

	getMemberCount: async (householdId: Household['id']) => {
		const members = await db.query.householdMembers.findMany({
			where: { householdId },
		})
		return members.length
	},

	disableHouseholdExpensesForUser: async (householdId: Household['id'], userId: User['id']) => {
		await db
			.update(expenses)
			.set({ active: false })
			.where(and(eq(expenses.householdId, householdId), eq(expenses.userId, userId)))
	},
}
