import { useAuth } from '~/lib/hooks/use-auth'

type LoggedOutProps = {
	children: React.ReactNode
}

export const LoggedOut = ({ children }: LoggedOutProps) => {
	const { user } = useAuth()

	if (user) {
		return
	}

	return <>{children}</>
}
