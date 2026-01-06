import type { Income } from '@repo/db/types'
import { useMutation } from '@tanstack/react-query'
import { useAppForm } from '~/lib/hooks/form-hook'
import { updateIncomeOptions } from '~/lib/mutations/incomes.mutations'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { IncomeFields, type IncomeFormValues, incomeFormSchema } from './income-fields'

type EditIncomeDialogProps = {
	income: Income
	open: boolean
	onOpenChange: (open: boolean) => void
}

const incomeToFormValues = (income: Income): IncomeFormValues => ({
	name: income.name,
	amount: income.amount,
	period: income.period,
	startDate: income.startDate,
	endDate: income.endDate ?? '',
})

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
			mutate(
				{
					name: value.name.trim(),
					amount: value.amount,
					period: value.period,
					startDate: value.startDate,
					endDate: value.endDate || null,
				},
				{ onSuccess: () => onOpenChange(false) }
			)
		},
	})

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Income</DialogTitle>
				</DialogHeader>

				<form
					className="flex flex-col gap-4"
					onSubmit={(e) => {
						e.preventDefault()
						form.handleSubmit()
					}}
				>
					<IncomeFields
						fields={{
							name: 'name',
							amount: 'amount',
							period: 'period',
							startDate: 'startDate',
							endDate: 'endDate',
						}}
						form={form}
					/>

					<form.AppForm>
						<form.SubmitButton disabled={isPending} label="Save" />
					</form.AppForm>
				</form>
			</DialogContent>
		</Dialog>
	)
}
