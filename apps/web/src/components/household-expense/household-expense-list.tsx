import { api } from '@repo/convex/_generated/api'
import { useQuery } from 'convex/react'
import { Loader } from '../ui/loader'
import { HouseholdExpenseItem } from './household-expense-item'

type SplitMode = 'equal' | 'income_proportional'

type HouseholdExpenseListProps = {
	memberCount: number
	splitMode: SplitMode
}

export const HouseholdExpenseList = ({ memberCount, splitMode }: HouseholdExpenseListProps) => {
	const expenses = useQuery(api.household_expenses.list)

	if (expenses === undefined) return <Loader className="text-muted-foreground" />

	if (expenses.length === 0) return null

	return (
		<div className="flex flex-col gap-2">
			{expenses.map((expense) => (
				<HouseholdExpenseItem
					expense={expense}
					key={expense._id}
					memberCount={memberCount}
					splitMode={splitMode}
				/>
			))}
		</div>
	)
}
