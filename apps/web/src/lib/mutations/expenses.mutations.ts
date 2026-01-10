import { eden, edenMutationOption } from '~/lib/clients/eden-client'
import { keys } from '../queries/keys'

export const createExpenseOptions = () =>
	edenMutationOption({
		edenMutation: eden.expenses.post,
		meta: { invalidate: [keys.expenses.list()] },
	})

export const updateExpenseOptions = (id: string) =>
	edenMutationOption({
		edenMutation: eden.expenses({ id }).patch,
		meta: { invalidate: [keys.expenses.list()] },
	})

export const deleteExpenseOptions = (id: string) =>
	edenMutationOption({
		edenMutation: eden.expenses({ id }).delete,
		meta: { invalidate: [keys.expenses.list()] },
	})
