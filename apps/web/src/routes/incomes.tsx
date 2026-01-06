import { createFileRoute } from '@tanstack/react-router'
import { Footer } from '~/components/footer'
import { IncomeListCard } from '~/components/income/income-list-card'
import { Navbar } from '~/components/navigation/navbar'

export const Route = createFileRoute('/incomes')({
	component: IncomesPage,
})

function IncomesPage() {
	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />
			<main className="flex flex-1 items-center justify-center">
				<IncomeListCard />
			</main>
			<Footer />
		</div>
	)
}
