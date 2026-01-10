import { pocketInsertSchema, pocketUpdateSchema } from '@repo/db/types'
import { Elysia } from 'elysia'
import z from 'zod'
import { betterAuth } from '#middlewares/auth'
import { PocketsService } from './service'

export const pocketsRouter = new Elysia({ name: 'pockets', tags: ['Pocket'] })
	.use(betterAuth)
	.model('uuidParam', z.object({ id: z.uuidv7() }))

	.get('/pockets', ({ user }) => PocketsService.getUserPockets(user.id), {
		auth: true,
	})

	.post(
		'/pockets',
		async ({ body, status, user }) => {
			const createdPocket = await PocketsService.createPocket({ userId: user.id, ...body })

			return status('Created', createdPocket)
		},
		{ auth: true, body: pocketInsertSchema }
	)

	.patch(
		'/pockets/:id',
		async ({ body, params, status, user }) => {
			const pocket = await PocketsService.getPocket(params.id)

			if (!pocket) return status('Not Found')
			if (pocket.userId !== user.id) return status('Forbidden')

			const emptyBody = !(body.name || body.amount)
			if (emptyBody) return pocket

			const updatedPocket = await PocketsService.updatePocket(params.id, body)

			return status('OK', updatedPocket)
		},
		{ auth: true, body: pocketUpdateSchema, params: 'uuidParam' }
	)

	.delete(
		'/pockets/:id',
		async ({ params, status, user }) => {
			const pocket = await PocketsService.getPocket(params.id)

			if (!pocket) return status('Not Found')
			if (pocket.userId !== user.id) return status('Forbidden')

			await PocketsService.deletePocket(params.id)

			return status('No Content')
		},
		{ auth: true, params: 'uuidParam' }
	)
