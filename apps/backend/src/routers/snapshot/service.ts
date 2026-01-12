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
		const prev = new Date()
		prev.setMonth(prev.getMonth() - 1)
		const year = prev.getFullYear()
		const month = prev.getMonth() + 1

		const {
			year: _,
			month: __,
			...data
		} = await BalanceService.getMonthlyBalance(userId, year, month)

		return SnapshotsService.saveSnapshot(userId, year, month, data)
	},

	getUserSnapshots: (userId: User['id']): Promise<Snapshot[]> =>
		db
			.select()
			.from(snapshots)
			.where(eq(snapshots.userId, userId))
			.orderBy(desc(snapshots.year), desc(snapshots.month)),
}
