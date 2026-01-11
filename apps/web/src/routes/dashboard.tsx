import { createFileRoute } from '@tanstack/react-router'
import { DashboardOverview } from '~/components/dashboard/dashboard-overview'
import { Footer } from '~/components/footer'
import { Navbar } from '~/components/navigation/navbar'

export const Route = createFileRoute('/dashboard')({
	component: DashboardPage,
})

function DashboardPage() {
	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />
			<main className="flex flex-1 items-center justify-center">
				<DashboardOverview />
			</main>
			<Footer />
		</div>
	)
}
