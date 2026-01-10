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
