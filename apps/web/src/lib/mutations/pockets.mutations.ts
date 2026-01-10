import { eden, edenMutationOption } from '~/lib/clients/eden-client'
import { keys } from '../queries/keys'

export const createPocketOptions = () =>
	edenMutationOption({
		edenMutation: eden.pockets.post,
		meta: { invalidate: [keys.pockets.list()] },
	})

export const updatePocketOptions = (id: string) =>
	edenMutationOption({
		edenMutation: eden.pockets({ id }).patch,
		meta: { invalidate: [keys.pockets.list()] },
	})

export const deletePocketOptions = (id: string) =>
	edenMutationOption({
		edenMutation: eden.pockets({ id }).delete,
		meta: { invalidate: [keys.pockets.list()] },
	})
