import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'
import { DashboardOverview } from '~/components/dashboard/dashboard-overview'
import { DashboardTabs } from '~/components/dashboard/dashboard-tabs'
import { Footer } from '~/components/footer'
import { HouseholdSettings } from '~/components/household/household-settings'
import { Navbar } from '~/components/navigation/navbar'

const searchSchema = z.object({
	tab: z.enum(['personnel', 'foyer']).optional().default('personnel'),
})

export const Route = createFileRoute('/')({
	component: DashboardPage,
	validateSearch: searchSchema,
})

function DashboardPage() {
	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />
			<main className="flex flex-1 items-center justify-center px-4 py-8">
				<DashboardTabs
					householdContent={<HouseholdSettings />}
					personalContent={<DashboardOverview />}
				/>
			</main>
			<Footer />
		</div>
	)
}
