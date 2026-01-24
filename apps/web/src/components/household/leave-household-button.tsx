import { api } from '@repo/convex/_generated/api'
import type { Id } from '@repo/convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { Loader2, LogOut } from 'lucide-react'
import { useState } from 'react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '../ui/alert-dialog'
import { Button } from '../ui/button'

type LeaveHouseholdButtonProps = {
	householdId: Id<'households'>
	householdName: string
}

export const LeaveHouseholdButton = ({ householdId, householdName }: LeaveHouseholdButtonProps) => {
	const [isOpen, setIsOpen] = useState(false)
	const [isPending, setIsPending] = useState(false)
	const leaveMutation = useMutation(api.households.leave)

	const handleLeave = async () => {
		setIsPending(true)
		try {
			await leaveMutation({ id: householdId })
			setIsOpen(false)
		} finally {
			setIsPending(false)
		}
	}

	return (
		<>
			<Button
				className="w-full"
				disabled={isPending}
				onClick={() => setIsOpen(true)}
				variant="destructive"
			>
				{isPending ? <Loader2 className="animate-spin" size={16} /> : <LogOut size={16} />}
				<span className="ml-2">Quitter le foyer</span>
			</Button>

			<AlertDialog onOpenChange={setIsOpen} open={isOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Quitter le foyer ?</AlertDialogTitle>
						<AlertDialogDescription>
							Vous quitterez &quot;{householdName}&quot;. Vos dépenses de foyer seront désactivées.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Annuler</AlertDialogCancel>
						<AlertDialogAction onClick={handleLeave}>Quitter</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
