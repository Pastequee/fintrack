import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { UsersTable } from '~/components/admin/users-table'
import { Footer } from '~/components/footer'
import { Navbar } from '~/components/navigation/navbar'
import { useAuth } from '~/lib/hooks/use-auth'

export const Route = createFileRoute('/admin/users')({
	component: AdminUsersPage,
})

function AdminUsersPage() {
	const { user, isLoading, isAuthenticated } = useAuth()
	const navigate = useNavigate()

	useEffect(() => {
		if (!isLoading) {
			if (!isAuthenticated) {
				navigate({ to: '/login', replace: true })
			} else if (user?.role !== 'admin') {
				navigate({ to: '/', replace: true })
			}
		}
	}, [isLoading, isAuthenticated, user, navigate])

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-muted-foreground">Chargement...</div>
			</div>
		)
	}

	if (!user || user.role !== 'admin') return null

	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />
			<main className="flex flex-1 flex-col gap-6 px-4 py-8">
				<div className="mx-auto w-full max-w-6xl space-y-6">
					<div>
						<h1 className="font-bold text-2xl">User Management</h1>
						<p className="text-muted-foreground text-sm">Manage users, roles, and permissions</p>
					</div>

					<UsersTable />
				</div>
			</main>
			<Footer />
		</div>
	)
}
