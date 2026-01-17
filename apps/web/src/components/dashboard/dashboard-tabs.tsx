import { useNavigate, useSearch } from '@tanstack/react-router'
import { Home, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

type TabValue = 'personnel' | 'foyer'

type DashboardTabsProps = {
	personalContent: ReactNode
	householdContent: ReactNode
}

export function DashboardTabs({ personalContent, householdContent }: DashboardTabsProps) {
	const navigate = useNavigate()
	const search = useSearch({ strict: false }) as { tab?: string }
	const currentTab: TabValue = search.tab === 'foyer' ? 'foyer' : 'personnel'

	return (
		<Tabs
			className="w-full max-w-5xl"
			onValueChange={(value) => navigate({ to: '/', search: { tab: value }, replace: true })}
			value={currentTab}
		>
			<TabsList className="mb-4 w-full">
				<TabsTrigger className="flex-1 gap-2" value="personnel">
					<Home size={16} />
					Personnel
				</TabsTrigger>
				<TabsTrigger className="flex-1 gap-2" value="foyer">
					<Users size={16} />
					Foyer
				</TabsTrigger>
			</TabsList>

			<TabsContent value="personnel">{personalContent}</TabsContent>

			<TabsContent value="foyer">{householdContent}</TabsContent>
		</Tabs>
	)
}
