import type { SplitMode } from '@repo/db/types'
import { useQuery } from '@tanstack/react-query'
import { householdExpenseListOptions } from '~/lib/queries/households.queries'
import { Loader } from '../ui/loader'
import { HouseholdExpenseItem } from './household-expense-item'

type HouseholdExpenseListProps = {
	memberCount: number
	splitMode: SplitMode
}

export const HouseholdExpenseList = ({ memberCount, splitMode }: HouseholdExpenseListProps) => {
	const { data: expenses, isLoading, isSuccess } = useQuery(householdExpenseListOptions())

	if (isLoading) return <Loader className="text-muted-foreground" />

	if (!isSuccess || expenses.length === 0) return null

	return (
		<div className="flex flex-col gap-2">
			{expenses.map((expense) => (
				<HouseholdExpenseItem
					expense={expense}
					key={expense.id}
					memberCount={memberCount}
					splitMode={splitMode}
				/>
			))}
		</div>
	)
}
