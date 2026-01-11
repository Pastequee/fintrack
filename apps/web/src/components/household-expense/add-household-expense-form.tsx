import { useMutation } from '@tanstack/react-query'
import { useAppForm } from '~/lib/hooks/form-hook'
import { createHouseholdExpenseOptions } from '~/lib/mutations/households.mutations'
import {
	defaultExpenseValues,
	ExpenseFields,
	expenseFormSchema,
	toExpensePayload,
} from '../expense/expense-fields'

export const AddHouseholdExpenseForm = () => {
	const { isPending, mutate } = useMutation(createHouseholdExpenseOptions())

	const form = useAppForm({
		defaultValues: defaultExpenseValues,
		validators: {
			onChange: expenseFormSchema,
			onMount: expenseFormSchema,
			onSubmit: expenseFormSchema,
		},
		onSubmit: ({ value }) => {
			mutate(toExpensePayload(value), { onSuccess: () => form.reset() })
		},
	})

	return (
		<form
			className="flex flex-col gap-4"
			onSubmit={(e) => {
				e.preventDefault()
				form.handleSubmit()
			}}
		>
			<ExpenseFields form={form} />

			<form.AppForm>
				<form.SubmitButton disabled={isPending} label="Add Expense" />
			</form.AppForm>
		</form>
	)
}
