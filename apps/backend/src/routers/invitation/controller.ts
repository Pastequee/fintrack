import { invitationInsertSchema } from '@repo/db/types'
import { Elysia } from 'elysia'
import z from 'zod'
import { betterAuth } from '#middlewares/auth'
import { HouseholdsService } from '../household/service'
import { InvitationsService } from './service'

export const invitationsRouter = new Elysia({ name: 'invitations', tags: ['Invitation'] })
	.use(betterAuth)
	.model('tokenParam', z.object({ token: z.string().uuid() }))

	// Get pending invitations for current user's household
	.get(
		'/invitations',
		async ({ user }) => {
			const membership = await HouseholdsService.getUserMembership(user.id)
			if (!membership) return []
			return InvitationsService.getPendingInvitationsByHousehold(membership.householdId)
		},
		{ auth: true }
	)

	// Get pending invitations sent to current user
	.get(
		'/invitations/pending',
		({ user }) => InvitationsService.getPendingInvitationsForUser(user.email),
		{ auth: true }
	)

	// Get invitation by token (public - for invitation landing page)
	.get(
		'/invitations/token/:token',
		async ({ params, status }) => {
			const invitation = await InvitationsService.getInvitationByToken(params.token)
			if (!invitation) return status('Not Found')

			if (invitation.status !== 'pending') {
				return status('Gone', { error: 'Invitation is no longer valid' })
			}

			if (new Date() > invitation.expiresAt) {
				await InvitationsService.updateInvitationStatus(invitation.id, 'expired')
				return status('Gone', { error: 'Invitation has expired' })
			}

			return invitation
		},
		{ params: 'tokenParam' }
	)

	// Send invitation
	.post(
		'/invitations',
		async ({ body, status, user }) => {
			const membership = await HouseholdsService.getUserMembership(user.id)
			if (!membership) {
				return status('Forbidden', { error: 'You must be in a household to send invitations' })
			}

			const existing = await InvitationsService.getInvitationByEmail(
				body.email,
				membership.householdId
			)
			if (existing?.status === 'pending') {
				return status('Conflict', { error: 'Invitation already sent to this email' })
			}

			const invitation = await InvitationsService.createInvitation({
				householdId: membership.householdId,
				invitedBy: user.id,
				email: body.email,
				token: InvitationsService.generateToken(),
				expiresAt: InvitationsService.getExpirationDate(),
			})

			const result = await InvitationsService.getInvitation(invitation.id)
			return status('Created', result)
		},
		{ auth: true, body: invitationInsertSchema }
	)

	// Accept invitation
	.post(
		'/invitations/token/:token/accept',
		async ({ params, status, user }) => {
			const invitation = await InvitationsService.getInvitationByToken(params.token)
			if (!invitation) return status('Not Found')

			if (invitation.status !== 'pending') {
				return status('Gone', { error: 'Invitation is no longer valid' })
			}

			if (new Date() > invitation.expiresAt) {
				await InvitationsService.updateInvitationStatus(invitation.id, 'expired')
				return status('Gone', { error: 'Invitation has expired' })
			}

			const existingMembership = await HouseholdsService.getUserMembership(user.id)
			if (existingMembership) {
				return status('Conflict', { error: 'Already a member of a household' })
			}

			await HouseholdsService.addMember({
				householdId: invitation.householdId,
				userId: user.id,
			})
			await InvitationsService.updateInvitationStatus(invitation.id, 'accepted')

			const household = await HouseholdsService.getHouseholdWithMembers(invitation.householdId)
			return status('OK', household)
		},
		{ auth: true, params: 'tokenParam' }
	)

	// Decline invitation
	.post(
		'/invitations/token/:token/decline',
		async ({ params, status }) => {
			const invitation = await InvitationsService.getInvitationByToken(params.token)
			if (!invitation) return status('Not Found')

			if (invitation.status !== 'pending') {
				return status('Gone', { error: 'Invitation is no longer valid' })
			}

			await InvitationsService.updateInvitationStatus(invitation.id, 'declined')
			return status('No Content')
		},
		{ auth: true, params: 'tokenParam' }
	)
