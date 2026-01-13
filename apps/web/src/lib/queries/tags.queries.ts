import { eden, edenQueryOption } from '~/lib/clients/eden-client'
import { keys } from './keys'

export const tagListOptions = () =>
	edenQueryOption({
		edenQuery: eden.tags.get,
		queryKey: keys.tags.list(),
	})
