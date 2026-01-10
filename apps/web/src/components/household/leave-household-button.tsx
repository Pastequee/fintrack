import { useMutation } from '@tanstack/react-query'
import { Loader2, LogOut } from 'lucide-react'
import { useState } from 'react'
import { leaveHouseholdOptions } from '~/lib/mutations/households.mutations'
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
	householdId: string
	householdName: string
}

export const LeaveHouseholdButton = ({ householdId, householdName }: LeaveHouseholdButtonProps) => {
	const [isOpen, setIsOpen] = useState(false)
	const { mutate, isPending } = useMutation(leaveHouseholdOptions(householdId))

	return (
		<>
			<Button
				className="w-full"
				disabled={isPending}
				onClick={() => setIsOpen(true)}
				variant="destructive"
			>
				{isPending ? <Loader2 className="animate-spin" size={16} /> : <LogOut size={16} />}
				<span className="ml-2">Leave Household</span>
			</Button>

			<AlertDialog onOpenChange={setIsOpen} open={isOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Leave household?</AlertDialogTitle>
						<AlertDialogDescription>
							You will leave &quot;{householdName}&quot;. Your household expenses will be disabled.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={() => mutate({})}>Leave</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
