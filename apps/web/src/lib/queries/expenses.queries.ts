import { edenQueryOption } from '~/lib/clients/eden-client'
import { eden } from '../server-fn/eden'
import { keys } from './keys'

export const expenseListOptions = () =>
	edenQueryOption({
		edenQuery: eden().expenses.get,
		queryKey: keys.expenses.list(),
	})
