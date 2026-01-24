import { api } from '@repo/convex/_generated/api'
import type { Doc } from '@repo/convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import { useAppForm } from '~/lib/hooks/form-hook'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import {
	ExpenseFields,
	expenseFormSchema,
	expenseToFormValues,
	toConvexExpensePayload,
} from './expense-fields'

type EditExpenseDialogProps = {
	expense: Doc<'expenses'>
	open: boolean
	onOpenChange: (open: boolean) => void
}

export const EditExpenseDialog = ({ expense, open, onOpenChange }: EditExpenseDialogProps) => {
	const updateMutation = useMutation(api.expenses.update)
	const [isPending, setIsPending] = useState(false)

	const form = useAppForm({
		defaultValues: expenseToFormValues(expense),
		validators: {
			onChange: expenseFormSchema,
			onMount: expenseFormSchema,
			onSubmit: expenseFormSchema,
		},
		onSubmit: async ({ value }) => {
			setIsPending(true)
			try {
				await updateMutation({ id: expense._id, ...toConvexExpensePayload(value) })
				onOpenChange(false)
			} finally {
				setIsPending(false)
			}
		},
	})

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Modifier la dépense</DialogTitle>
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
						<form.SubmitButton disabled={isPending} label="Enregistrer" />
					</form.AppForm>
				</form>
			</DialogContent>
		</Dialog>
	)
}
