import { eden, edenMutationOption } from '~/lib/clients/eden-client'
import { keys } from '../queries/keys'

const expenseInvalidations = [keys.expenses.list(), keys.stats.all, keys.balance.all]

export const createExpenseOptions = () =>
	edenMutationOption({
		edenMutation: eden.expenses.post,
		meta: { invalidate: expenseInvalidations },
	})

export const updateExpenseOptions = (id: string) =>
	edenMutationOption({
		edenMutation: eden.expenses({ id }).patch,
		meta: { invalidate: expenseInvalidations },
	})

export const deleteExpenseOptions = (id: string) =>
	edenMutationOption({
		edenMutation: eden.expenses({ id }).delete,
		meta: { invalidate: expenseInvalidations },
	})
