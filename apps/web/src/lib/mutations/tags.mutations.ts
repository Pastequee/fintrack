import { eden, edenMutationOption } from '~/lib/clients/eden-client'
import { keys } from '../queries/keys'

export const createTagOptions = () =>
	edenMutationOption({
		edenMutation: eden.tags.post,
		meta: { invalidate: [keys.tags.list()] },
	})

export const updateTagOptions = (id: string) =>
	edenMutationOption({
		edenMutation: eden.tags({ id }).patch,
		meta: { invalidate: [keys.tags.list()] },
	})

export const deleteTagOptions = (id: string) =>
	edenMutationOption({
		edenMutation: eden.tags({ id }).delete,
		meta: { invalidate: [keys.tags.list()] },
	})
