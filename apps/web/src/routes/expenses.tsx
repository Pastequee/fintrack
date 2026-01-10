import { createFileRoute } from '@tanstack/react-router'
import { ExpenseListCard } from '~/components/expense/expense-list-card'
import { Footer } from '~/components/footer'
import { Navbar } from '~/components/navigation/navbar'

export const Route = createFileRoute('/expenses')({
	component: ExpensesPage,
})

function ExpensesPage() {
	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />
			<main className="flex flex-1 items-center justify-center">
				<ExpenseListCard />
			</main>
			<Footer />
		</div>
	)
}
