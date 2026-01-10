import { useQuery } from '@tanstack/react-query'
import { householdInvitationsOptions } from '~/lib/queries/households.queries'
import { Loader } from '../ui/loader'
import { PendingInvitationItem } from './pending-invitation-item'

export const PendingInvitations = () => {
	const { data: invitations, isLoading } = useQuery(householdInvitationsOptions())

	if (isLoading) return <Loader className="text-muted-foreground" />

	if (!invitations || invitations.length === 0) return null

	return (
		<div className="flex flex-col gap-3">
			<h3 className="font-medium text-sm">Pending Invitations</h3>
			<div className="flex flex-col gap-2">
				{invitations.map((inv) => (
					<PendingInvitationItem invitation={inv} key={inv.id} />
				))}
			</div>
		</div>
	)
}
