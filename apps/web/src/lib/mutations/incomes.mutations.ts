import { eden, edenMutationOption } from '~/lib/clients/eden-client'
import { keys } from '../queries/keys'

export const createIncomeOptions = () =>
	edenMutationOption({
		edenMutation: eden.incomes.post,
		meta: { invalidate: [keys.incomes.list()] },
	})

export const updateIncomeOptions = (id: string) =>
	edenMutationOption({
		edenMutation: eden.incomes({ id }).patch,
		meta: { invalidate: [keys.incomes.list()] },
	})

export const deleteIncomeOptions = (id: string) =>
	edenMutationOption({
		edenMutation: eden.incomes({ id }).delete,
		meta: { invalidate: [keys.incomes.list()] },
	})
