import { api } from '@repo/convex/_generated/api'
import { useQuery } from 'convex/react'
import { Loader } from '../ui/loader'
import { IncomeItem } from './income-item'

export const IncomeList = () => {
	const incomes = useQuery(api.incomes.list)

	if (incomes === undefined) return <Loader className="text-muted-foreground" />

	if (incomes.length === 0) return null

	return (
		<div className="flex flex-col gap-2">
			{incomes.map((income) => (
				<IncomeItem income={income} key={income._id} />
			))}
		</div>
	)
}
