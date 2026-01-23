import { MutationCache, QueryClient, type QueryKey } from '@tanstack/react-query'

declare module '@tanstack/react-query' {
	// biome-ignore lint/style/useConsistentTypeDefinitions: need interface here
	interface Register {
		mutationMeta: {
			invalidate?: QueryKey[]
		}
	}
}

export const queryClient = new QueryClient({
	mutationCache: new MutationCache({
		onSettled: async (_data, _variables, _error, _mutate, _mutation, context) => {
			await Promise.all(
				context.meta?.invalidate?.map((queryKey) =>
					context.client.invalidateQueries({ queryKey })
				) ?? []
			)
		},
	}),
	defaultOptions: { queries: { staleTime: 60 * 1000 } },
})
