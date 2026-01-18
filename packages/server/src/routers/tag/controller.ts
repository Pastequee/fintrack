import { tagInsertSchema, tagUpdateSchema } from '@repo/db/types'
import { Elysia } from 'elysia'
import z from 'zod'
import { betterAuth } from '#middlewares/auth'
import { TagsService } from './service'

export const tagsRouter = new Elysia({ name: 'tags', tags: ['Tag'] })
	.use(betterAuth)
	.model('uuidParam', z.object({ id: z.uuidv7() }))

	.get('/tags', ({ user }) => TagsService.getUserTags(user.id), {
		auth: true,
	})

	.post(
		'/tags',
		async ({ body, status, user }) => {
			const createdTag = await TagsService.createTag({ userId: user.id, ...body })

			return status('Created', createdTag)
		},
		{ auth: true, body: tagInsertSchema }
	)

	.patch(
		'/tags/:id',
		async ({ body, params, status, user }) => {
			const tag = await TagsService.getTag(params.id)

			if (!tag) return status('Not Found')
			if (tag.userId !== user.id) return status('Forbidden')

			if (!body.name && !body.color) return tag

			const updatedTag = await TagsService.updateTag(params.id, body)

			return status('OK', updatedTag)
		},
		{ auth: true, body: tagUpdateSchema, params: 'uuidParam' }
	)

	.delete(
		'/tags/:id',
		async ({ params, status, user }) => {
			const tag = await TagsService.getTag(params.id)

			if (!tag) return status('Not Found')
			if (tag.userId !== user.id) return status('Forbidden')

			await TagsService.deleteTag(params.id)

			return status('No Content')
		},
		{ auth: true, params: 'uuidParam' }
	)
