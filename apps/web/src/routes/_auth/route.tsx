import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import z from 'zod'
import { Navbar } from '~/components/navigation/navbar'

export const Route = createFileRoute('/_auth')({
	component: AuthLayout,
	validateSearch: z.object({
		redirect: z.string().optional(),
	}),
	beforeLoad: ({ context, search }) => {
		// If user is already authenticated, redirect to home
		if (context.auth) {
			throw redirect({ to: search.redirect ?? '/' })
		}
	},
})

function AuthLayout() {
	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />
			<main className="flex flex-1 items-center justify-center">
				<Outlet />
			</main>
		</div>
	)
}
