import { Clock, Mail } from 'lucide-react'

type PendingInvitationItemProps = {
	invitation: {
		email: string
		expiresAt: Date
		inviter: { name: string } | null
	}
}

function formatExpiry(date: Date) {
	const msPerDay = 1000 * 60 * 60 * 24
	const days = Math.ceil((new Date(date).getTime() - Date.now()) / msPerDay)
	if (days <= 0) return 'Expired'
	return `${days} day${days === 1 ? '' : 's'} left`
}

export const PendingInvitationItem = ({ invitation }: PendingInvitationItemProps) => (
	<div className="flex items-center gap-3">
		<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
			<Mail className="text-muted-foreground" size={16} />
		</div>
		<div className="flex min-w-0 flex-1 flex-col">
			<span className="truncate font-medium text-sm">{invitation.email}</span>
			<span className="flex items-center gap-1 text-muted-foreground text-xs">
				<Clock size={10} />
				{formatExpiry(invitation.expiresAt)}
			</span>
		</div>
	</div>
)
