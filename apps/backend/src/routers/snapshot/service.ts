import { db } from '@repo/db'
import { snapshots } from '@repo/db/schemas'
import type { Snapshot, SnapshotData, User } from '@repo/db/types'
import { and, desc, eq } from 'drizzle-orm'
import { BalanceService } from '#routers/balance/service'

export const SnapshotsService = {
	getSnapshot: (userId: User['id'], year: number, month: number): Promise<Snapshot | undefined> =>
		db
			.select()
			.from(snapshots)
			.where(
				and(eq(snapshots.userId, userId), eq(snapshots.year, year), eq(snapshots.month, month))
			)
			.then((rows) => rows[0]),

	saveSnapshot: async (
		userId: User['id'],
		year: number,
		month: number,
		data: SnapshotData
	): Promise<Snapshot> => {
		const existing = await SnapshotsService.getSnapshot(userId, year, month)

		if (existing) {
			const [updated] = await db
				.update(snapshots)
				.set({ data })
				.where(eq(snapshots.id, existing.id))
				.returning()
			// biome-ignore lint/style/noNonNullAssertion: always returns
			return updated!
		}

		const [created] = await db.insert(snapshots).values({ userId, year, month, data }).returning()
		// biome-ignore lint/style/noNonNullAssertion: always returns
		return created!
	},

	archivePreviousMonth: async (userId: User['id']): Promise<Snapshot> => {
		const now = new Date()
		let year = now.getFullYear()
		let month = now.getMonth() // 0-indexed, so this is previous month
		if (month === 0) {
			month = 12
			year--
		}

		const { income, personalExpenses, householdShare, pockets, remaining } =
			await BalanceService.getMonthlyBalance(userId, year, month)

		return SnapshotsService.saveSnapshot(userId, year, month, {
			income,
			personalExpenses,
			householdShare,
			pockets,
			remaining,
		})
	},

	getUserSnapshots: (userId: User['id']): Promise<Snapshot[]> =>
		db
			.select()
			.from(snapshots)
			.where(eq(snapshots.userId, userId))
			.orderBy(desc(snapshots.year), desc(snapshots.month)),
}
