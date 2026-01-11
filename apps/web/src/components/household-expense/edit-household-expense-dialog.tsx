import type { Expense } from '@repo/db/types'
import { useMutation } from '@tanstack/react-query'
import { useAppForm } from '~/lib/hooks/form-hook'
import { updateHouseholdExpenseOptions } from '~/lib/mutations/households.mutations'
import {
	ExpenseFields,
	expenseFormSchema,
	expenseToFormValues,
	toExpensePayload,
} from '../expense/expense-fields'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'

type EditHouseholdExpenseDialogProps = {
	expense: Expense
	open: boolean
	onOpenChange: (open: boolean) => void
}

export const EditHouseholdExpenseDialog = ({
	expense,
	open,
	onOpenChange,
}: EditHouseholdExpenseDialogProps) => {
	const { isPending, mutate } = useMutation(updateHouseholdExpenseOptions(expense.id))

	const form = useAppForm({
		defaultValues: expenseToFormValues(expense),
		validators: {
			onChange: expenseFormSchema,
			onMount: expenseFormSchema,
			onSubmit: expenseFormSchema,
		},
		onSubmit: ({ value }) => {
			mutate(toExpensePayload(value), { onSuccess: () => onOpenChange(false) })
		},
	})

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Household Expense</DialogTitle>
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
