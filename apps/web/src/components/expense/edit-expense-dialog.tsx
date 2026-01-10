import type { Expense } from '@repo/db/types'
import { useMutation } from '@tanstack/react-query'
import { useAppForm } from '~/lib/hooks/form-hook'
import { updateExpenseOptions } from '~/lib/mutations/expenses.mutations'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { ExpenseFields, type ExpenseFormValues, expenseFormSchema } from './expense-fields'

type EditExpenseDialogProps = {
	expense: Expense
	open: boolean
	onOpenChange: (open: boolean) => void
}

const expenseToFormValues = (expense: Expense): ExpenseFormValues => ({
	name: expense.name,
	amount: expense.amount,
	type: expense.type,
	period: expense.period ?? 'monthly',
	startDate: expense.startDate ?? new Date().toISOString().slice(0, 10),
	endDate: expense.endDate ?? '',
	targetDate: expense.targetDate ?? new Date().toISOString().slice(0, 10),
})

export const EditExpenseDialog = ({ expense, open, onOpenChange }: EditExpenseDialogProps) => {
	const { isPending, mutate } = useMutation(updateExpenseOptions(expense.id))

	const form = useAppForm({
		defaultValues: expenseToFormValues(expense),
		validators: {
			onChange: expenseFormSchema,
			onMount: expenseFormSchema,
			onSubmit: expenseFormSchema,
		},
		onSubmit: ({ value }) => {
			const isOneTime = value.type === 'one_time'
			mutate(
				{
					name: value.name.trim(),
					amount: value.amount,
					type: value.type,
					period: isOneTime ? null : value.period,
					startDate: isOneTime ? null : value.startDate,
					endDate: isOneTime ? null : value.endDate || null,
					targetDate: isOneTime ? value.targetDate : null,
				},
				{ onSuccess: () => onOpenChange(false) }
			)
		},
	})

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Expense</DialogTitle>
				</DialogHeader>

				<form
					className="flex flex-col gap-4"
					onSubmit={(e) => {
						e.preventDefault()
						form.handleSubmit()
					}}
				>
					<ExpenseFields form={form} />

					<form.AppForm>
						<form.SubmitButton disabled={isPending} label="Save" />
					</form.AppForm>
				</form>
			</DialogContent>
		</Dialog>
	)
}
