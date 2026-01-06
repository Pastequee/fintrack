import type { Income } from '@repo/db/types'
import { useMutation } from '@tanstack/react-query'
import { updateIncomeOptions } from '~/lib/mutations/incomes.mutations'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { IncomeForm } from './income-form'

type EditIncomeDialogProps = {
	income: Income
	open: boolean
	onOpenChange: (open: boolean) => void
}

export const EditIncomeDialog = ({ income, open, onOpenChange }: EditIncomeDialogProps) => {
	const { isPending, mutate } = useMutation(updateIncomeOptions(income.id))

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Income</DialogTitle>
				</DialogHeader>

				<IncomeForm
					income={income}
					isPending={isPending}
					onSubmit={(values) => {
						return new Promise((resolve) => {
							mutate(
								{
									name: values.name.trim(),
									amount: values.amount,
									period: values.period,
									startDate: values.startDate,
									endDate: values.endDate || null,
								},
								{ onSettled: () => resolve() }
							)
						})
					}}
					onSuccess={() => onOpenChange(false)}
					submitLabel="Save"
				/>
			</DialogContent>
		</Dialog>
	)
}
