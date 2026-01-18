import { db } from '@repo/db'
import { tags } from '@repo/db/schemas'
import type { Tag, TagInsert, TagUpdate, User } from '@repo/db/types'
import { eq } from 'drizzle-orm'

export const TagsService = {
	getUserTags: async (userId: User['id']) =>
		db.query.tags.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
		}),

	getTag: async (id: Tag['id']) =>
		db.query.tags.findFirst({
			where: { id },
		}),

	createTag: async (data: TagInsert) =>
		db
			.insert(tags)
			.values(data)
			.returning()
			// biome-ignore lint/style/noNonNullAssertion: always returns a tag
			.then(([tag]) => tag!),

	updateTag: async (id: Tag['id'], data: TagUpdate) =>
		db
			.update(tags)
			.set(data)
			.where(eq(tags.id, id))
			.returning()
			// biome-ignore lint/style/noNonNullAssertion: always returns a tag
			.then(([tag]) => tag!),

	deleteTag: async (id: Tag['id']) => {
		await db.delete(tags).where(eq(tags.id, id))
	},
}
