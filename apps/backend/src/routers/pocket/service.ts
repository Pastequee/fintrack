import { db } from '@repo/db'
import { pockets } from '@repo/db/schemas'
import type { Pocket, PocketInsert, PocketUpdate, User } from '@repo/db/types'
import { eq } from 'drizzle-orm'

export const PocketsService = {
	getUserPockets: async (userId: User['id']) =>
		db.query.pockets.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
		}),

	getPocket: async (id: Pocket['id']) =>
		db.query.pockets.findFirst({
			where: { id },
		}),

	createPocket: async (data: PocketInsert) =>
		db
			.insert(pockets)
			.values(data)
			.returning()
			// biome-ignore lint/style/noNonNullAssertion: always returns a pocket
			.then(([pocket]) => pocket!),

	updatePocket: async (id: Pocket['id'], data: PocketUpdate) =>
		db
			.update(pockets)
			.set(data)
			.where(eq(pockets.id, id))
			.returning()
			// biome-ignore lint/style/noNonNullAssertion: always returns a pocket
			.then(([pocket]) => pocket!),

	deletePocket: async (id: Pocket['id']) => {
		await db.delete(pockets).where(eq(pockets.id, id))
	},
}
