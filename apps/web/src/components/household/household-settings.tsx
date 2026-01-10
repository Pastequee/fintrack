import { useQuery } from '@tanstack/react-query'
import { householdMeOptions } from '~/lib/queries/households.queries'
import { LoggedIn } from '../auth/logged-in'
import { LoggedOut } from '../auth/logged-out'
import { Card, CardContent } from '../ui/card'
import { Loader } from '../ui/loader'
import { Separator } from '../ui/separator'
import { CreateHouseholdForm } from './create-household-form'
import { InviteForm } from './invite-form'
import { LeaveHouseholdButton } from './leave-household-button'
import { MemberList } from './member-list'
import { PendingInvitations } from './pending-invitations'
import { SplitModeToggle } from './split-mode-toggle'

export const HouseholdSettings = () => {
	const { data: household, isLoading } = useQuery(householdMeOptions())

	return (
		<Card className="mx-auto w-[90vw] max-w-md">
			<CardContent className="flex flex-col gap-4">
				<h2 className="font-semibold text-lg">Household</h2>

				<LoggedOut>
					<p className="text-center text-muted-foreground text-sm">
						You must be logged in to manage household
					</p>
				</LoggedOut>

				<LoggedIn>
					{isLoading ? (
						<Loader className="text-muted-foreground" />
					) : household ? (
						<>
							<div className="flex flex-col gap-1">
								<span className="font-medium text-xl">{household.name}</span>
								<span className="text-muted-foreground text-xs">
									{household.members.length} member{household.members.length !== 1 ? 's' : ''}
								</span>
							</div>

							<Separator />

							<SplitModeToggle currentMode={household.splitMode} householdId={household.id} />

							<Separator />

							<MemberList members={household.members} />

							<Separator />

							<InviteForm />

							<PendingInvitations />

							<Separator />

							<LeaveHouseholdButton householdId={household.id} householdName={household.name} />
						</>
					) : (
						<CreateHouseholdForm />
					)}
				</LoggedIn>
			</CardContent>
		</Card>
	)
}
