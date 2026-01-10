import { useQuery } from '@tanstack/react-query'
import { pocketListOptions } from '~/lib/queries/pockets.queries'
import { Loader } from '../ui/loader'
import { PocketItem } from './pocket-item'

export const PocketList = () => {
	const { data: pockets, isLoading, isSuccess } = useQuery(pocketListOptions())

	if (isLoading) return <Loader className="text-muted-foreground" />

	if (!isSuccess || pockets.length === 0) return null

	return (
		<div className="flex flex-col gap-2">
			{pockets.map((pocket) => (
				<PocketItem key={pocket.id} pocket={pocket} />
			))}
		</div>
	)
}
