import { eden, edenQueryOption } from '~/lib/clients/eden-client'
import { keys } from './keys'

export const householdMeOptions = () =>
	edenQueryOption({
		edenQuery: eden.households.me.get,
		queryKey: keys.households.me(),
	})

export const householdInvitationsOptions = () =>
	edenQueryOption({
		edenQuery: eden.invitations.get,
		queryKey: keys.invitations.list(),
	})
