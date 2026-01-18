import { useMutation } from '@tanstack/react-query'
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
import { revokeInvitationOptions } from '~/lib/mutations/households.mutations'

type PendingInvitationItemProps = {
	invitation: {
		id: string
		email: string
		expiresAt: Date
	}
}

function formatExpiry(date: Date) {
	const msPerDay = 1000 * 60 * 60 * 24
	const days = Math.ceil((new Date(date).getTime() - Date.now()) / msPerDay)
	if (days <= 0) return 'Expiré'
	return `${days} jour${days === 1 ? '' : 's'} restant${days === 1 ? '' : 's'}`
}

export const PendingInvitationItem = ({ invitation }: PendingInvitationItemProps) => {
	const revoke = useMutation(revokeInvitationOptions(invitation.id))

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
						<AlertDialogAction onClick={() => revoke.mutate({})}>Révoquer</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
