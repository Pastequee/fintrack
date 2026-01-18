import { edenQueryOption } from '~/lib/clients/eden-client'
import { eden } from '../server-fn/eden'
import { keys } from './keys'

export const householdMeOptions = () =>
	edenQueryOption({
		edenQuery: eden().households.me.get,
		queryKey: keys.households.me(),
	})

export const householdInvitationsOptions = () =>
	edenQueryOption({
		edenQuery: eden().invitations.get,
		queryKey: keys.invitations.list(),
	})

export const invitationByTokenOptions = (token: string) =>
	edenQueryOption({
		edenQuery: eden().invitations.token({ token }).get,
		queryKey: keys.invitations.byToken(token),
	})

export const householdExpenseListOptions = () =>
	edenQueryOption({
		edenQuery: eden()['household-expenses'].get,
		queryKey: keys.householdExpenses.list(),
	})
