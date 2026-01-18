import { edenMutationOption } from '~/lib/clients/eden-client'
import { keys } from '../queries/keys'
import { eden } from '../server-fn/eden'

const expenseInvalidations = [keys.expenses.list(), keys.stats.all, keys.balance.all]

export const createExpenseOptions = () =>
	edenMutationOption({
		edenMutation: eden().expenses.post,
		meta: { invalidate: expenseInvalidations },
	})

export const updateExpenseOptions = (id: string) =>
	edenMutationOption({
		edenMutation: eden().expenses({ id }).patch,
		meta: { invalidate: expenseInvalidations },
	})

export const deleteExpenseOptions = (id: string) =>
	edenMutationOption({
		edenMutation: eden().expenses({ id }).delete,
		meta: { invalidate: expenseInvalidations },
	})
