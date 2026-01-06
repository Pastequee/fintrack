import { useMutation } from '@tanstack/react-query'
import { useAppForm } from '~/lib/hooks/form-hook'
import { createIncomeOptions } from '~/lib/mutations/incomes.mutations'
import { LoggedIn } from '../auth/logged-in'
import { defaultIncomeValues, IncomeFields, incomeFormSchema } from './income-fields'

export const AddIncomeForm = () => {
	const { isPending, mutate } = useMutation(createIncomeOptions())

	const form = useAppForm({
		defaultValues: defaultIncomeValues,
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
					<form.SubmitButton disabled={isPending} label="Add Income" />
				</form.AppForm>
			</form>
		</LoggedIn>
	)
}
