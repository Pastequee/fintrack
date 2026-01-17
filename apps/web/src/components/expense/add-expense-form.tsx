import { useMutation } from '@tanstack/react-query'
import { useAppForm } from '~/lib/hooks/form-hook'
import { createExpenseOptions } from '~/lib/mutations/expenses.mutations'
import { LoggedIn } from '../auth/logged-in'
import {
	defaultExpenseValues,
	ExpenseFields,
	expenseFormSchema,
	toExpensePayload,
} from './expense-fields'

export const AddExpenseForm = () => {
	const { isPending, mutate } = useMutation(createExpenseOptions())

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
		<LoggedIn>
			<form
				className="flex flex-col gap-4"
				onSubmit={(e) => {
					e.preventDefault()
					form.handleSubmit()
				}}
			>
				<ExpenseFields form={form} />

				<form.AppForm>
					<form.SubmitButton disabled={isPending} label="Ajouter une dépense" />
				</form.AppForm>
			</form>
		</LoggedIn>
	)
}
