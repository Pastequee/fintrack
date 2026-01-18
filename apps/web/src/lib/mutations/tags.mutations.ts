import { edenMutationOption } from '~/lib/clients/eden-client'
import { keys } from '../queries/keys'
import { eden } from '../server-fn/eden'

const tagInvalidations = [keys.tags.list(), keys.stats.all]

export const createTagOptions = () =>
	edenMutationOption({
		edenMutation: eden().tags.post,
		meta: { invalidate: tagInvalidations },
	})

export const updateTagOptions = (id: string) =>
	edenMutationOption({
		edenMutation: eden().tags({ id }).patch,
		meta: { invalidate: tagInvalidations },
	})

export const deleteTagOptions = (id: string) =>
	edenMutationOption({
		edenMutation: eden().tags({ id }).delete,
		meta: { invalidate: tagInvalidations },
	})
