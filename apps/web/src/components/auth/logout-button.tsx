import { Button } from '~/components/ui/button'
import { useAuth } from '~/lib/hooks/use-auth'

export const LogoutButton = () => {
	const { logout } = useAuth()

	return <Button onClick={logout}>Déconnexion</Button>
}
