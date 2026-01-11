import { Link } from '@tanstack/react-router'
import { useAuth } from '~/lib/hooks/use-auth'
import { LoggedIn } from '../auth/logged-in'
import { LoggedOut } from '../auth/logged-out'
import { ThemeSwitcher } from '../ui/theme-switcher'
import { HouseholdBadge } from './household-badge'
import { MobileNav } from './mobile-nav'
import { NavbarLink } from './navbar-link'
import { UserMenu } from './user-menu'

export const Navbar = () => {
	const auth = useAuth()
	const isAdmin = auth?.user.role === 'admin'

	return (
		<header className="sticky top-0 z-10 flex items-center justify-center gap-4 border-b bg-background p-4">
			<nav className="flex max-w-7xl flex-1 items-center justify-end gap-4">
				<Link className="mr-auto font-bold text-xl" to="/">
					FinTrack
				</Link>

				<LoggedIn>
					{/* Desktop nav */}
					<div className="hidden items-center gap-4 md:flex">
						<NavbarLink to="/dashboard">Dashboard</NavbarLink>
						<NavbarLink to="/incomes">Incomes</NavbarLink>
						<NavbarLink to="/expenses">Expenses</NavbarLink>
						<NavbarLink to="/pockets">Pockets</NavbarLink>
						<NavbarLink to="/household">Household</NavbarLink>
						{isAdmin && <NavbarLink to="/admin/users">Admin</NavbarLink>}
					</div>
					<HouseholdBadge />
				</LoggedIn>

				<ThemeSwitcher />

				<LoggedOut>
					<div className="flex gap-2">
						<NavbarLink to="/login">Login</NavbarLink>
						<NavbarLink to="/register">Register</NavbarLink>
					</div>
				</LoggedOut>

				<LoggedIn>
					<UserMenu />
					<MobileNav />
				</LoggedIn>
			</nav>
		</header>
	)
}
