import { createFileRoute } from '@tanstack/react-router'
import { Footer } from '~/components/footer'
import { HouseholdSettings } from '~/components/household/household-settings'
import { Navbar } from '~/components/navigation/navbar'

export const Route = createFileRoute('/household')({
	component: HouseholdPage,
})

function HouseholdPage() {
	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />
			<main className="flex flex-1 items-center justify-center">
				<HouseholdSettings />
			</main>
			<Footer />
		</div>
	)
}
