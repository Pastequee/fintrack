import type { Expense } from '@repo/db/types'
import { useMutation } from '@tanstack/react-query'
import { CalendarDays, Loader2, Pencil, Repeat, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { deleteExpenseOptions } from '~/lib/mutations/expenses.mutations'
import {
	formatExpenseAmount,
	formatShortDate,
	getRemainingDuration,
} from '~/lib/utils/expense-format'
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
import { EditExpenseDialog } from './edit-expense-dialog'

type ExpenseItemProps = {
	expense: Expense
}

export const ExpenseItem = ({ expense }: ExpenseItemProps) => {
	const [isEditOpen, setIsEditOpen] = useState(false)
	const [isDeleteOpen, setIsDeleteOpen] = useState(false)

	const { isPending: isDeleting, mutate: deleteMutation } = useMutation(
		deleteExpenseOptions(expense.id)
	)

	const isOneTime = expense.type === 'one_time'
	const remaining = isOneTime ? null : getRemainingDuration(expense.endDate)

	return (
		<div className="flex items-center gap-4">
			<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
				{isOneTime ? (
					<CalendarDays className="text-muted-foreground" size={16} />
				) : (
					<Repeat className="text-muted-foreground" size={16} />
				)}
			</div>

			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<span className="truncate font-semibold text-sm">{expense.name}</span>
				<div className="flex items-center gap-2">
					<span className="text-muted-foreground text-xs">
						{formatExpenseAmount(expense.amount, expense.type, expense.period)}
					</span>
					{isOneTime && expense.targetDate && (
						<span className="text-muted-foreground text-xs">
							le {formatShortDate(expense.targetDate)}
						</span>
					)}
					{remaining && <span className="text-muted-foreground text-xs">• {remaining}</span>}
				</div>
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

			<EditExpenseDialog expense={expense} onOpenChange={setIsEditOpen} open={isEditOpen} />

			<AlertDialog onOpenChange={setIsDeleteOpen} open={isDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Supprimer la dépense ?</AlertDialogTitle>
						<AlertDialogDescription>
							Ceci supprimera définitivement « {expense.name} ».
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Annuler</AlertDialogCancel>
						<AlertDialogAction onClick={() => deleteMutation({})}>Supprimer</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
