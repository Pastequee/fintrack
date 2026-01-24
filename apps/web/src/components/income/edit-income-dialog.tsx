import { api } from '@repo/convex/_generated/api'
import type { Doc } from '@repo/convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import { useAppForm } from '~/lib/hooks/form-hook'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import {
	IncomeFields,
	incomeFormSchema,
	incomeToFormValues,
	toConvexIncomePayload,
} from './income-fields'

type EditIncomeDialogProps = {
	income: Doc<'incomes'>
	open: boolean
	onOpenChange: (open: boolean) => void
}

export const EditIncomeDialog = ({ income, open, onOpenChange }: EditIncomeDialogProps) => {
	const updateMutation = useMutation(api.incomes.update)
	const [isPending, setIsPending] = useState(false)

	const form = useAppForm({
		defaultValues: incomeToFormValues(income),
		validators: {
			onChange: incomeFormSchema,
			onMount: incomeFormSchema,
			onSubmit: incomeFormSchema,
		},
		onSubmit: async ({ value }) => {
			setIsPending(true)
			try {
				await updateMutation({ id: income._id, ...toConvexIncomePayload(value) })
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
					<DialogTitle>Modifier le revenu</DialogTitle>
				</DialogHeader>

				<form
					className="flex flex-col gap-4"
					onSubmit={(e) => {
						e.preventDefault()
						form.handleSubmit()
					}}
				>
					<IncomeFields form={form} />

					<form.AppForm>
						<form.SubmitButton disabled={isPending} label="Enregistrer" />
					</form.AppForm>
				</form>
			</DialogContent>
		</Dialog>
	)
}
