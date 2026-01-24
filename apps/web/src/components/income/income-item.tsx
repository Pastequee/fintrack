import { api } from '@repo/convex/_generated/api'
import type { Doc } from '@repo/convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { Loader2, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'
import { EditIncomeDialog } from './edit-income-dialog'

type IncomePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'

type IncomeItemProps = {
	income: Doc<'incomes'>
}

const periodLabels: Record<IncomePeriod, string> = {
	daily: '/jour',
	weekly: '/sem',
	monthly: '/mois',
	yearly: '/an',
}

const formatAmount = (amount: number, period: IncomePeriod) => {
	return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €${periodLabels[period]}`
}

export const IncomeItem = ({ income }: IncomeItemProps) => {
	const [isEditOpen, setIsEditOpen] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)

	const deleteMutation = useMutation(api.incomes.remove)

	const handleDelete = async () => {
		setIsDeleting(true)
		try {
			await deleteMutation({ id: income._id })
		} finally {
			setIsDeleting(false)
		}
	}

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

			<Button disabled={isDeleting} onClick={handleDelete} size="icon" variant="destructive">
				{isDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
			</Button>

			<EditIncomeDialog income={income} onOpenChange={setIsEditOpen} open={isEditOpen} />
		</div>
	)
}
