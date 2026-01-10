import type { Pocket } from '@repo/db/types'
import { useMutation } from '@tanstack/react-query'
import { Loader2, Pencil, Trash2, Wallet } from 'lucide-react'
import { useState } from 'react'
import { deletePocketOptions } from '~/lib/mutations/pockets.mutations'
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
import { EditPocketDialog } from './edit-pocket-dialog'

type PocketItemProps = {
	pocket: Pocket
}

const formatAmount = (amount: string) => {
	const num = Number.parseFloat(amount)
	return `€${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const PocketItem = ({ pocket }: PocketItemProps) => {
	const [isEditOpen, setIsEditOpen] = useState(false)
	const [isDeleteOpen, setIsDeleteOpen] = useState(false)

	const { isPending: isDeleting, mutate: deleteMutation } = useMutation(
		deletePocketOptions(pocket.id)
	)

	return (
		<div className="flex items-center gap-4">
			<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
				<Wallet className="text-muted-foreground" size={16} />
			</div>

			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<span className="truncate font-semibold text-sm">{pocket.name}</span>
				<span className="text-muted-foreground text-xs">{formatAmount(pocket.amount)}</span>
			</div>

			<Button onClick={() => setIsEditOpen(true)} size="icon" variant="ghost">
				<Pencil size={16} />
			</Button>

			<Button
				disabled={isDeleting}
				onClick={() => setIsDeleteOpen(true)}
				size="icon"
				variant="destructive"
			>
				{isDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
			</Button>

			<EditPocketDialog onOpenChange={setIsEditOpen} open={isEditOpen} pocket={pocket} />

			<AlertDialog onOpenChange={setIsDeleteOpen} open={isDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete pocket?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete &quot;{pocket.name}&quot;.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={() => deleteMutation({})}>Delete</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
