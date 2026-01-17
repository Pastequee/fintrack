import type { Expense, SplitMode } from '@repo/db/types'
import { useMutation } from '@tanstack/react-query'
import {
	AlertTriangle,
	CalendarDays,
	Loader2,
	Pencil,
	RefreshCcw,
	Repeat,
	Trash2,
} from 'lucide-react'
import { useState } from 'react'
import {
	deleteHouseholdExpenseOptions,
	updateHouseholdExpenseOptions,
} from '~/lib/mutations/households.mutations'
import { cn } from '~/lib/utils/cn'
import {
	formatExpenseAmount,
	formatShortDate,
	getRemainingDuration,
	getSplitAmount,
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
import { EditHouseholdExpenseDialog } from './edit-household-expense-dialog'

type HouseholdExpenseItemProps = {
	expense: Expense
	memberCount: number
	splitMode: SplitMode
}

function getExpenseIcon(isDisabled: boolean, isOneTime: boolean) {
	if (isDisabled) return <AlertTriangle className="text-amber-500" size={16} />
	if (isOneTime) return <CalendarDays className="text-muted-foreground" size={16} />
	return <Repeat className="text-muted-foreground" size={16} />
}

export const HouseholdExpenseItem = ({
	expense,
	memberCount,
	splitMode,
}: HouseholdExpenseItemProps) => {
	const [isEditOpen, setIsEditOpen] = useState(false)
	const [isDeleteOpen, setIsDeleteOpen] = useState(false)

	const { isPending: isDeleting, mutate: deleteMutation } = useMutation(
		deleteHouseholdExpenseOptions(expense.id)
	)
	const { isPending: isReenabling, mutate: reenableMutation } = useMutation(
		updateHouseholdExpenseOptions(expense.id)
	)

	const isOneTime = expense.type === 'one_time'
	const isDisabled = !expense.active
	const remaining = isOneTime ? null : getRemainingDuration(expense.endDate)
	const splitLabel =
		splitMode === 'equal'
			? getSplitAmount(expense.amount, memberCount)
			: 'proportionnel aux revenus'

	return (
		<div className={cn('flex items-center gap-4', isDisabled && 'opacity-50')}>
			<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
				{getExpenseIcon(isDisabled, isOneTime)}
			</div>

			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<div className="flex items-center gap-2">
					<span className="truncate font-semibold text-sm">{expense.name}</span>
					{isDisabled && (
						<span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-700 text-xs">
							Désactivé
						</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					<span className="text-muted-foreground text-xs">
						{formatExpenseAmount(expense.amount, expense.type, expense.period)}
					</span>
					{splitLabel && <span className="text-muted-foreground text-xs">• {splitLabel}</span>}
					{isOneTime && expense.targetDate && (
						<span className="text-muted-foreground text-xs">
							le {formatShortDate(expense.targetDate)}
						</span>
					)}
					{remaining && <span className="text-muted-foreground text-xs">• {remaining}</span>}
				</div>
			</div>

			{isDisabled ? (
				<Button
					disabled={isReenabling}
					onClick={() => reenableMutation({ active: true })}
					size="icon"
					variant="outline"
				>
					{isReenabling ? <Loader2 className="animate-spin" size={16} /> : <RefreshCcw size={16} />}
				</Button>
			) : (
				<Button onClick={() => setIsEditOpen(true)} size="icon" variant="ghost">
					<Pencil size={16} />
				</Button>
			)}

			<Button
				disabled={isDeleting}
				onClick={() => setIsDeleteOpen(true)}
				size="icon"
				variant="destructive"
			>
				{isDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
			</Button>

			<EditHouseholdExpenseDialog
				expense={expense}
				onOpenChange={setIsEditOpen}
				open={isEditOpen}
			/>

			<AlertDialog onOpenChange={setIsDeleteOpen} open={isDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Supprimer la dépense du foyer ?</AlertDialogTitle>
						<AlertDialogDescription>
							Cette dépense sera définitivement supprimée pour tous les membres du foyer.
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
