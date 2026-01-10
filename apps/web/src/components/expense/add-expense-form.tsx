import { useMutation } from '@tanstack/react-query'
import { useAppForm } from '~/lib/hooks/form-hook'
import { createExpenseOptions } from '~/lib/mutations/expenses.mutations'
import { LoggedIn } from '../auth/logged-in'
import { defaultExpenseValues, ExpenseFields, expenseFormSchema } from './expense-fields'

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
				{ onSuccess: () => form.reset() }
			)
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
					<form.SubmitButton disabled={isPending} label="Add Expense" />
				</form.AppForm>
			</form>
		</LoggedIn>
	)
}
