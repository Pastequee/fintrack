import { Link } from '@tanstack/react-router'
import { LogOut, Settings, User } from 'lucide-react'
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
	const { user, logout } = useAuth()

	if (!user) return null

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
					<DropdownMenuLabel>{user.name || user.email}</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem render={<Link to="/account" />}>
						<Settings className="size-4" />
						Compte
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={logout} variant="destructive">
						<LogOut className="size-4" />
						Déconnexion
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
