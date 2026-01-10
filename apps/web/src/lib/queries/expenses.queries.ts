import { eden, edenQueryOption } from '~/lib/clients/eden-client'
import { keys } from './keys'

export const expenseListOptions = () =>
	edenQueryOption({
		edenQuery: eden.expenses.get,
		queryKey: keys.expenses.list(),
	})
