import { edenQueryOption } from '~/lib/clients/eden-client'
import { eden } from '../server-fn/eden'
import { keys } from './keys'

export const incomeListOptions = () =>
	edenQueryOption({
		edenQuery: eden().incomes.get,
		queryKey: keys.incomes.list(),
	})
