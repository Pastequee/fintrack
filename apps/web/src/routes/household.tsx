import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Footer } from '~/components/footer'
import { HouseholdSettings } from '~/components/household/household-settings'
import { HouseholdExpenseCard } from '~/components/household-expense/household-expense-card'
import { Navbar } from '~/components/navigation/navbar'
import { householdMeOptions } from '~/lib/queries/households.queries'

export const Route = createFileRoute('/household')({
	component: HouseholdPage,
})

function HouseholdPage() {
	const { data: household } = useQuery(householdMeOptions())

	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />
			<main className="flex flex-1 flex-col items-center justify-center gap-6 py-6">
				<HouseholdSettings />
				{household && <HouseholdExpenseCard />}
			</main>
			<Footer />
		</div>
	)
}
