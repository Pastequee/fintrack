import { createFileRoute, Outlet, useNavigate, useSearch } from '@tanstack/react-router'
import { useConvexAuth } from 'convex/react'
import { useEffect } from 'react'
import z from 'zod'
import { Navbar } from '~/components/navigation/navbar'

export const Route = createFileRoute('/_auth')({
	component: AuthLayout,
	validateSearch: z.object({
		redirect: z.string().optional(),
	}),
})

function AuthLayout() {
	const { isAuthenticated, isLoading } = useConvexAuth()
	const navigate = useNavigate()
	const { redirect: redirectTo } = useSearch({ from: '/_auth' })

	useEffect(() => {
		if (!isLoading && isAuthenticated) {
			navigate({ to: redirectTo ?? '/', replace: true })
		}
	}, [isLoading, isAuthenticated, navigate, redirectTo])

	// Show loading or content
	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-muted-foreground">Chargement...</div>
			</div>
		)
	}

	// If authenticated, we'll redirect above, so don't render the form
	if (isAuthenticated) return null

	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />
			<main className="flex flex-1 items-center justify-center">
				<Outlet />
			</main>
		</div>
	)
}
