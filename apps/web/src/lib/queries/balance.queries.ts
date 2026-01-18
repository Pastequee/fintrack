import { edenQueryOption } from '~/lib/clients/eden-client'
import { eden } from '../server-fn/eden'
import { keys } from './keys'

export const balanceOptions = (year: number, month: number) =>
	edenQueryOption({
		edenQuery: eden().balance({ year })({ month }).get,
		queryKey: keys.balance.month(year, month),
	})

export const snapshotOptions = (year: number, month: number) =>
	edenQueryOption({
		edenQuery: eden().snapshots({ year })({ month }).get,
		queryKey: keys.snapshots.month(year, month),
	})
