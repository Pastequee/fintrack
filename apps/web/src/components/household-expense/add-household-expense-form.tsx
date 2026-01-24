import { api } from '@repo/convex/_generated/api'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import { useAppForm } from '~/lib/hooks/form-hook'
import {
	defaultExpenseValues,
	ExpenseFields,
	expenseFormSchema,
	toConvexExpensePayload,
} from '../expense/expense-fields'

export const AddHouseholdExpenseForm = () => {
	const createMutation = useMutation(api.household_expenses.create)
	const [isPending, setIsPending] = useState(false)

	const form = useAppForm({
		defaultValues: defaultExpenseValues,
		validators: {
			onChange: expenseFormSchema,
			onMount: expenseFormSchema,
			onSubmit: expenseFormSchema,
		},
		onSubmit: async ({ value }) => {
			setIsPending(true)
			try {
				await createMutation(toConvexExpensePayload(value))
				form.reset()
			} finally {
				setIsPending(false)
			}
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
				<form.SubmitButton disabled={isPending} label="Ajouter une dépense" />
			</form.AppForm>
		</form>
	)
}
