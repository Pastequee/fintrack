import { api } from '@repo/convex/_generated/api'
import type { Id } from '@repo/convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { Clock, Mail, X } from 'lucide-react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'

type PendingInvitationItemProps = {
	invitation: {
		_id: Id<'invitations'>
		email: string
		expiresAt: number
	}
}

function formatExpiry(timestamp: number) {
	const msPerDay = 1000 * 60 * 60 * 24
	const days = Math.ceil((timestamp - Date.now()) / msPerDay)
	if (days <= 0) return 'Expiré'
	return `${days} jour${days === 1 ? '' : 's'} restant${days === 1 ? '' : 's'}`
}

export const PendingInvitationItem = ({ invitation }: PendingInvitationItemProps) => {
	const revokeMutation = useMutation(api.invitations.revoke)

	const handleRevoke = () => {
		revokeMutation({ id: invitation._id })
	}

	return (
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
			<AlertDialog>
				<AlertDialogTrigger
					render={
						<Button className="shrink-0 text-muted-foreground" size="icon-sm" variant="ghost">
							<X size={14} />
						</Button>
					}
				/>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Révoquer l'invitation ?</AlertDialogTitle>
						<AlertDialogDescription>
							L'invitation envoyée à {invitation.email} sera supprimée.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Annuler</AlertDialogCancel>
						<AlertDialogAction onClick={handleRevoke}>Révoquer</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
