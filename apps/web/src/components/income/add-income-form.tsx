import { useMutation } from '@tanstack/react-query'
import { createIncomeOptions } from '~/lib/mutations/incomes.mutations'
import { LoggedIn } from '../auth/logged-in'
import { IncomeForm } from './income-form'

export const AddIncomeForm = () => {
	const { isPending, mutate } = useMutation(createIncomeOptions())

	return (
		<LoggedIn>
			<IncomeForm
				isPending={isPending}
				onSubmit={(values) => {
					return new Promise((resolve) => {
						mutate(
							{
								name: values.name.trim(),
								amount: values.amount,
								period: values.period,
								startDate: values.startDate,
							},
							{ onSettled: () => resolve() }
						)
					})
				}}
				submitLabel="Add Income"
			/>
		</LoggedIn>
	)
}
