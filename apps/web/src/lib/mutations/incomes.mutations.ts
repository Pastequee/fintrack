import { eden, edenMutationOption } from '~/lib/clients/eden-client'
import { keys } from '../queries/keys'

const incomeInvalidations = [keys.incomes.list(), keys.balance.all]

export const createIncomeOptions = () =>
	edenMutationOption({
		edenMutation: eden.incomes.post,
		meta: { invalidate: incomeInvalidations },
	})

export const updateIncomeOptions = (id: string) =>
	edenMutationOption({
		edenMutation: eden.incomes({ id }).patch,
		meta: { invalidate: incomeInvalidations },
	})

export const deleteIncomeOptions = (id: string) =>
	edenMutationOption({
		edenMutation: eden.incomes({ id }).delete,
		meta: { invalidate: incomeInvalidations },
	})
