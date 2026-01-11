import { Link, useRouter } from '@tanstack/react-router'
import { LogOut, Settings, User } from 'lucide-react'
import { authClient } from '~/lib/clients/auth-client'
import { useAuth } from '~/lib/hooks/use-auth'
import { Button } from '../ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '../ui/dropdown-menu'

export const UserMenu = () => {
	const auth = useAuth()
	const router = useRouter()

	if (!auth) return null

	const handleLogout = async () => {
		await authClient.signOut()
		router.navigate({ to: '/login', replace: true })
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button size="icon" variant="ghost">
						<User className="size-5" />
					</Button>
				}
			/>
			<DropdownMenuContent align="end" sideOffset={8}>
				<DropdownMenuGroup>
					<DropdownMenuLabel>{auth.user.name || auth.user.email}</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem render={<Link to="/account" />}>
						<Settings className="size-4" />
						Account
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={handleLogout} variant="destructive">
						<LogOut className="size-4" />
						Logout
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
