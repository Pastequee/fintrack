import { useQuery } from '@tanstack/react-query'
import { expenseListOptions } from '~/lib/queries/expenses.queries'
import { Loader } from '../ui/loader'
import { ExpenseItem } from './expense-item'

export const ExpenseList = () => {
	const { data: expenses, isLoading, isSuccess } = useQuery(expenseListOptions())

	if (isLoading) return <Loader className="text-muted-foreground" />

	if (!isSuccess || expenses.length === 0) return null

	return (
		<div className="flex flex-col gap-2">
			{expenses.map((expense) => (
				<ExpenseItem expense={expense} key={expense.id} />
			))}
		</div>
	)
}
