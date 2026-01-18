import { edenQueryOption } from '~/lib/clients/eden-client'
import { eden } from '../server-fn/eden'
import { keys } from './keys'

export const tagListOptions = () =>
	edenQueryOption({
		edenQuery: eden().tags.get,
		queryKey: keys.tags.list(),
	})
