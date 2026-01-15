import { useMutation } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useAppForm } from '~/lib/hooks/form-hook'
import { createExpenseOptions } from '~/lib/mutations/expenses.mutations'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import {
	defaultExpenseValues,
	ExpenseFields,
	expenseFormSchema,
	toExpensePayload,
} from './expense-fields'

export const AddExpenseDialog = () => {
	const [open, setOpen] = useState(false)
	const { isPending, mutate } = useMutation(createExpenseOptions())

	const form = useAppForm({
		defaultValues: defaultExpenseValues,
		validators: {
			onChange: expenseFormSchema,
			onMount: expenseFormSchema,
			onSubmit: expenseFormSchema,
		},
		onSubmit: ({ value }) => {
			mutate(toExpensePayload(value), {
				onSuccess: () => {
					form.reset()
					setOpen(false)
				},
			})
		},
	})

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger
				render={
					<Button size="sm" variant="outline">
						<Plus size={16} />
						Ajouter
					</Button>
				}
			/>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Ajouter une dépense</DialogTitle>
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
						<form.SubmitButton disabled={isPending} label="Ajouter" />
					</form.AppForm>
				</form>
			</DialogContent>
		</Dialog>
	)
}
