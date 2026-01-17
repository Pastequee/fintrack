import { Link, useLocation } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '~/lib/hooks/use-auth'
import { cn } from '~/lib/utils/cn'
import { Button } from '../ui/button'

type NavLink = {
	to: string
	label: string
	adminOnly?: boolean
}

const navLinks: NavLink[] = [
	{ to: '/admin/users', label: 'Admin', adminOnly: true },
	{ to: '/account', label: 'Compte' },
]

const linkClassName = 'rounded-md px-3 py-2 font-medium text-sm transition-colors hover:bg-accent'

export function MobileNav() {
	const [open, setOpen] = useState(false)
	const auth = useAuth()
	const pathname = useLocation({ select: (l) => l.pathname })
	const isAdmin = auth?.user.role === 'admin'

	const visibleLinks = navLinks.filter((link) => !link.adminOnly || isAdmin)

	return (
		<div className="md:hidden">
			<Button onClick={() => setOpen(!open)} size="icon" variant="ghost">
				{open ? <X className="size-5" /> : <Menu className="size-5" />}
			</Button>

			{open && (
				<div className="absolute top-full right-0 left-0 z-50 border-b bg-background p-4 shadow-lg">
					<nav className="flex flex-col gap-2">
						{visibleLinks.map((link) => (
							<Link
								className={cn(linkClassName, pathname === link.to && 'bg-accent')}
								key={link.to}
								onClick={() => setOpen(false)}
								to={link.to}
							>
								{link.label}
							</Link>
						))}
					</nav>
				</div>
			)}
		</div>
	)
}
