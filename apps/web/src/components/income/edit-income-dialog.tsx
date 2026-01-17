import type { Income } from '@repo/db/types'
import { useMutation } from '@tanstack/react-query'
import { useAppForm } from '~/lib/hooks/form-hook'
import { updateIncomeOptions } from '~/lib/mutations/incomes.mutations'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import {
	IncomeFields,
	incomeFormSchema,
	incomeToFormValues,
	toIncomePayload,
} from './income-fields'

type EditIncomeDialogProps = {
	income: Income
	open: boolean
	onOpenChange: (open: boolean) => void
}

export const EditIncomeDialog = ({ income, open, onOpenChange }: EditIncomeDialogProps) => {
	const { isPending, mutate } = useMutation(updateIncomeOptions(income.id))

	const form = useAppForm({
		defaultValues: incomeToFormValues(income),
		validators: {
			onChange: incomeFormSchema,
			onMount: incomeFormSchema,
			onSubmit: incomeFormSchema,
		},
		onSubmit: ({ value }) => {
			mutate(toIncomePayload(value), { onSuccess: () => onOpenChange(false) })
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
