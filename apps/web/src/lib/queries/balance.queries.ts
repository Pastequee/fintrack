import { eden, edenQueryOption } from '~/lib/clients/eden-client'
import { keys } from './keys'

export const balanceOptions = (year: number, month: number) =>
	edenQueryOption({
		edenQuery: eden.balance({ year })({ month }).get,
		queryKey: keys.balance.month(year, month),
	})
