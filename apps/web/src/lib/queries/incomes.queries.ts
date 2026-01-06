import { eden, edenQueryOption } from '~/lib/clients/eden-client'
import { keys } from './keys'

export const incomeListOptions = () =>
	edenQueryOption({
		edenQuery: eden.incomes.get,
		queryKey: keys.incomes.list(),
	})
