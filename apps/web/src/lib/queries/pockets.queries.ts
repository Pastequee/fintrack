import { eden, edenQueryOption } from '~/lib/clients/eden-client'
import { keys } from './keys'

export const pocketListOptions = () =>
	edenQueryOption({
		edenQuery: eden.pockets.get,
		queryKey: keys.pockets.list(),
	})
