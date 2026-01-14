import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Home } from 'lucide-react'
import { householdMeOptions } from '~/lib/queries/households.queries'
import { Badge } from '../ui/badge'

export function HouseholdBadge() {
	const { data: household } = useQuery(householdMeOptions())

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
