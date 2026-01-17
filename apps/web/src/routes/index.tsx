import { createFileRoute, redirect } from '@tanstack/react-router'
import z from 'zod'
import { DashboardTabs } from '~/components/dashboard/dashboard-tabs'
import { PersonalTab } from '~/components/dashboard/personal-tab'
import { Footer } from '~/components/footer'
import { HouseholdSettings } from '~/components/household/household-settings'
import { Navbar } from '~/components/navigation/navbar'

const searchSchema = z.object({
	tab: z.enum(['personnel', 'foyer']).optional().default('personnel'),
})

export const Route = createFileRoute('/')({
	component: DashboardPage,
	validateSearch: searchSchema,
	beforeLoad: ({ context }) => {
		if (!context.auth) {
			throw redirect({ to: '/login' })
		}
	},
})

function DashboardPage() {
	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />
			<main className="flex flex-1 justify-center px-4 py-8">
				<DashboardTabs householdContent={<HouseholdSettings />} personalContent={<PersonalTab />} />
			</main>
			<Footer />
		</div>
	)
}
