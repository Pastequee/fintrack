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

type ExpenseWithTag = Expense & {
	tag: { id: string; name: string; color: string } | null
}

type ExpenseItemProps = {
	expense: ExpenseWithTag
}

const DEFAULT_TAG_COLOR = '#64748b' // slate-500

export const ExpenseItem = ({ expense }: ExpenseItemProps) => {
	const [isEditOpen, setIsEditOpen] = useState(false)
	const [isDeleteOpen, setIsDeleteOpen] = useState(false)

	const { isPending: isDeleting, mutate: deleteMutation } = useMutation(
		deleteExpenseOptions(expense.id)
	)

	const isOneTime = expense.type === 'one_time'
	const remaining = isOneTime ? null : getRemainingDuration(expense.endDate)
	const tagColor = expense.tag?.color ?? DEFAULT_TAG_COLOR

	return (
		<div
			className="relative flex items-center gap-4 rounded-lg py-2 pr-2 pl-4 transition-colors hover:bg-muted/50"
			style={{
				borderLeft: `3px solid ${tagColor}`,
			}}
		>
			<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
				{isOneTime ? (
					<CalendarDays className="text-muted-foreground" size={16} />
				) : (
					<Repeat className="text-muted-foreground" size={16} />
				)}
			</div>

			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<div className="flex items-center gap-2">
					<span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: tagColor }} />
					<span className="truncate font-semibold text-sm">{expense.name}</span>
					{expense.tag && (
						<span className="text-muted-foreground text-xs">({expense.tag.name})</span>
					)}
				</div>
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
