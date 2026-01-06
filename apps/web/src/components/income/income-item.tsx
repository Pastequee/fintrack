import type { Income, IncomePeriod } from '@repo/db/types'
import { useMutation } from '@tanstack/react-query'
import { Loader2, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { deleteIncomeOptions } from '~/lib/mutations/incomes.mutations'
import { Button } from '../ui/button'
import { EditIncomeDialog } from './edit-income-dialog'

type IncomeItemProps = {
	income: Income
}

const periodLabels: Record<IncomePeriod, string> = {
	daily: '/day',
	weekly: '/week',
	monthly: '/mo',
	yearly: '/year',
}

const formatAmount = (amount: string, period: IncomePeriod) => {
	const num = Number.parseFloat(amount)
	return `€${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${periodLabels[period]}`
}

export const IncomeItem = ({ income }: IncomeItemProps) => {
	const [isEditOpen, setIsEditOpen] = useState(false)

	const { isPending: isDeleting, mutate: deleteMutation } = useMutation(
		deleteIncomeOptions(income.id)
	)

	return (
		<div className="flex items-center gap-4">
			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<span className="truncate font-semibold text-sm">{income.name}</span>
				<span className="text-muted-foreground text-xs">
					{formatAmount(income.amount, income.period)}
				</span>
			</div>

			<Button onClick={() => setIsEditOpen(true)} size="icon" variant="ghost">
				<Pencil size={16} />
			</Button>

			<Button
				disabled={isDeleting}
				onClick={() => deleteMutation({})}
				size="icon"
				variant="destructive"
			>
				{isDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
			</Button>

			<EditIncomeDialog income={income} onOpenChange={setIsEditOpen} open={isEditOpen} />
		</div>
	)
}
