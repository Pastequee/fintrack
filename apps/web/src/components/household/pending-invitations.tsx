import { api } from '@repo/convex/_generated/api'
import { useQuery } from 'convex/react'
import { Loader } from '../ui/loader'
import { PendingInvitationItem } from './pending-invitation-item'

export const PendingInvitations = () => {
	const invitations = useQuery(api.invitations.pending)

	if (invitations === undefined) return <Loader className="text-muted-foreground" />

	if (invitations.length === 0) return null

	return (
		<div className="flex flex-col gap-3">
			<h3 className="font-medium text-sm">Invitations en attente</h3>
			<div className="flex flex-col gap-2">
				{invitations.map((inv) => (
					<PendingInvitationItem invitation={inv} key={inv._id} />
				))}
			</div>
		</div>
	)
}
