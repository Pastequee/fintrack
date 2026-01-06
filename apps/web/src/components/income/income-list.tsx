import { useQuery } from '@tanstack/react-query'
import { incomeListOptions } from '~/lib/queries/incomes.queries'
import { Loader } from '../ui/loader'
import { IncomeItem } from './income-item'

export const IncomeList = () => {
	const { data: incomes, isLoading, isSuccess } = useQuery(incomeListOptions())

	if (isLoading) return <Loader className="text-muted-foreground" />

	if (!isSuccess || incomes.length === 0) return null

	return (
		<div className="flex flex-col gap-2">
			{incomes.map((income) => (
				<IncomeItem income={income} key={income.id} />
			))}
		</div>
	)
}
