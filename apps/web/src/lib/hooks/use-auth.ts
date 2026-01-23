import { useAuthActions } from '@convex-dev/auth/react'
import { api } from '@repo/convex/_generated/api'
import { useNavigate } from '@tanstack/react-router'
import { useConvexAuth, useQuery } from 'convex/react'

export const useAuth = () => {
	const { isAuthenticated, isLoading } = useConvexAuth()
	const user = useQuery(api.users.me)
	const { signOut } = useAuthActions()
	const navigate = useNavigate()

	const logout = async () => {
		await signOut()
		navigate({ to: '/login', replace: true })
	}

	return {
		isAuthenticated,
		isLoading,
		user,
		logout,
	}
}
