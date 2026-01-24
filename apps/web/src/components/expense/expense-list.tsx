import { api } from '@repo/convex/_generated/api'
import { useQuery } from 'convex/react'
import { Loader } from '../ui/loader'
import { ExpenseItem } from './expense-item'

export const ExpenseList = () => {
	const expenses = useQuery(api.expenses.list)

	if (expenses === undefined) return <Loader className="text-muted-foreground" />

	if (expenses.length === 0) return null

	return (
		<div className="flex flex-col gap-2">
			{expenses.map((expense) => (
				<ExpenseItem expense={expense} key={expense._id} />
			))}
		</div>
	)
}
