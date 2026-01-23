import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useConvexAuth } from 'convex/react'
import { useEffect } from 'react'
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
})

function DashboardPage() {
	const { isAuthenticated, isLoading } = useConvexAuth()
	const navigate = useNavigate()

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			navigate({ to: '/login', replace: true })
		}
	}, [isLoading, isAuthenticated, navigate])

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-muted-foreground">Chargement...</div>
			</div>
		)
	}

	if (!isAuthenticated) return null

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
