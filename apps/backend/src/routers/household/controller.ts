import { householdInsertSchema, householdUpdateSchema } from '@repo/db/types'
import { Elysia } from 'elysia'
import z from 'zod'
import { betterAuth } from '#middlewares/auth'
import { HouseholdsService } from './service'

export const householdsRouter = new Elysia({ name: 'households', tags: ['Household'] })
	.use(betterAuth)
	.model('uuidParam', z.object({ id: z.uuidv7() }))

	.get('/households/me', ({ user }) => HouseholdsService.getUserHousehold(user.id), {
		auth: true,
	})

	.post(
		'/households',
		async ({ body, status, user }) => {
			const existingMembership = await HouseholdsService.getUserMembership(user.id)
			if (existingMembership) {
				return status('Conflict', { error: 'Already a member of a household' })
			}

			const household = await HouseholdsService.createHousehold(body)
			await HouseholdsService.addMember({ householdId: household.id, userId: user.id })

			const result = await HouseholdsService.getHouseholdWithMembers(household.id)
			return status('Created', result)
		},
		{ auth: true, body: householdInsertSchema }
	)

	.patch(
		'/households/:id',
		async ({ body, params, status, user }) => {
			const membership = await HouseholdsService.getUserMembership(user.id)
			if (!membership || membership.householdId !== params.id) {
				return status('Forbidden')
			}

			if (!body.name && !body.splitMode) {
				const household = await HouseholdsService.getHousehold(params.id)
				return household ?? status('Not Found')
			}

			const updated = await HouseholdsService.updateHousehold(params.id, body)
			return status('OK', updated)
		},
		{ auth: true, body: householdUpdateSchema, params: 'uuidParam' }
	)

	.delete(
		'/households/:id/leave',
		async ({ params, status, user }) => {
			const membership = await HouseholdsService.getUserMembership(user.id)
			if (!membership || membership.householdId !== params.id) {
				return status('Forbidden')
			}

			await HouseholdsService.disableHouseholdExpensesForUser(params.id, user.id)
			await HouseholdsService.removeMember(params.id, user.id)

			const remainingCount = await HouseholdsService.getMemberCount(params.id)
			if (remainingCount === 0) {
				await HouseholdsService.deleteHousehold(params.id)
			}

			return status('No Content')
		},
		{ auth: true, params: 'uuidParam' }
	)
