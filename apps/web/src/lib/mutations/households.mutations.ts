import { eden, edenMutationOption } from '~/lib/clients/eden-client'
import { keys } from '../queries/keys'

export const createHouseholdOptions = () =>
	edenMutationOption({
		edenMutation: eden.households.post,
		meta: { invalidate: [keys.households.me()] },
	})

export const updateHouseholdOptions = (id: string) =>
	edenMutationOption({
		edenMutation: eden.households({ id }).patch,
		meta: { invalidate: [keys.households.me()] },
	})

export const leaveHouseholdOptions = (id: string) =>
	edenMutationOption({
		edenMutation: eden.households({ id }).leave.delete,
		meta: { invalidate: [keys.households.me()] },
	})

export const sendInvitationOptions = () =>
	edenMutationOption({
		edenMutation: eden.invitations.post,
		meta: { invalidate: [keys.invitations.list()] },
	})

export const acceptInvitationOptions = (token: string) =>
	edenMutationOption({
		edenMutation: eden.invitations.token({ token }).accept.post,
		meta: { invalidate: [keys.households.me(), keys.invitations.byToken(token)] },
	})

export const declineInvitationOptions = (token: string) =>
	edenMutationOption({
		edenMutation: eden.invitations.token({ token }).decline.post,
		meta: { invalidate: [keys.invitations.byToken(token)] },
	})
