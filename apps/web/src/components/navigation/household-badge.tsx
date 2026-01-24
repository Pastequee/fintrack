import { api } from '@repo/convex/_generated/api'
import { Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { Home } from 'lucide-react'
import { Badge } from '../ui/badge'

export function HouseholdBadge() {
	const household = useQuery(api.households.me)

	if (!household) return null

	return (
		<Link to="/">
			<Badge className="gap-1" variant="secondary">
				<Home className="size-3" />
				{household.name}
			</Badge>
		</Link>
	)
}
