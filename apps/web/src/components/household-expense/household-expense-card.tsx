import { useQuery } from '@tanstack/react-query'
import { householdMeOptions } from '~/lib/queries/households.queries'
import { Card, CardContent } from '../ui/card'
import { Loader } from '../ui/loader'
import { Separator } from '../ui/separator'
import { AddHouseholdExpenseForm } from './add-household-expense-form'
import { HouseholdExpenseList } from './household-expense-list'

export const HouseholdExpenseCard = () => {
	const { data: household, isLoading } = useQuery(householdMeOptions())

	if (isLoading) {
		return (
			<Card className="mx-auto w-[90vw] max-w-md">
				<CardContent className="flex flex-col gap-4">
					<h2 className="font-semibold text-lg">Household Expenses</h2>
					<Loader className="text-muted-foreground" />
				</CardContent>
			</Card>
		)
	}

	if (!household) {
		return (
			<Card className="mx-auto w-[90vw] max-w-md">
				<CardContent className="flex flex-col gap-4">
					<h2 className="font-semibold text-lg">Household Expenses</h2>
					<p className="text-center text-muted-foreground text-sm">
						Join or create a household to manage shared expenses
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className="mx-auto w-[90vw] max-w-md">
			<CardContent className="flex flex-col gap-4">
				<div className="flex flex-col gap-1">
					<h2 className="font-semibold text-lg">Household Expenses</h2>
					<span className="text-muted-foreground text-xs">
						{household.name} • {household.members.length} member
						{household.members.length !== 1 ? 's' : ''} •{' '}
						{household.splitMode === 'equal' ? 'Split equally' : 'Split by income'}
					</span>
				</div>

				<AddHouseholdExpenseForm />

				<Separator className="last:hidden" />

				<HouseholdExpenseList
					memberCount={household.members.length}
					splitMode={household.splitMode}
				/>
			</CardContent>
		</Card>
	)
}
