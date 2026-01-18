import { useAuth } from '~/lib/hooks/use-auth'

type LoggedInProps = {
	children: React.ReactNode
}

export const LoggedIn = ({ children }: LoggedInProps) => {
	const { user } = useAuth()

	if (!user) {
		return
	}

	return <>{children}</>
}
