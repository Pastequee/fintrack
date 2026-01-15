import { useQuery } from '@tanstack/react-query'
import { Users, Wallet } from 'lucide-react'
import { balanceOptions } from '~/lib/queries/balance.queries'
import { householdMeOptions } from '~/lib/queries/households.queries'
import { cn } from '~/lib/utils/cn'
import { formatCurrency } from '~/lib/utils/format-currency'
import { LoggedIn } from '../auth/logged-in'
import { LoggedOut } from '../auth/logged-out'
import { AddHouseholdExpenseForm } from '../household-expense/add-household-expense-form'
import { HouseholdExpenseList } from '../household-expense/household-expense-list'
import { Card, CardContent } from '../ui/card'
import { Loader } from '../ui/loader'
import { Separator } from '../ui/separator'
import { CreateHouseholdForm } from './create-household-form'
import { InviteForm } from './invite-form'
import { LeaveHouseholdButton } from './leave-household-button'
import { MemberList } from './member-list'
import { PendingInvitations } from './pending-invitations'
import { SplitModeToggle } from './split-mode-toggle'

const ShareCard = ({ amount, memberCount }: { amount: number; memberCount: number }) => (
	<div
		className={cn(
			'flex flex-col gap-2 rounded-xl border p-4',
			'border-violet-200 bg-violet-50 dark:border-violet-800/50 dark:bg-violet-950/40'
		)}
	>
		<div className="flex items-center justify-between">
			<span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
				Ma part ce mois
			</span>
			<span className="text-violet-600 opacity-70 dark:text-violet-400">
				<Wallet size={18} />
			</span>
		</div>
		<span className="font-semibold text-violet-700 text-xl tabular-nums dark:text-violet-300">
			{formatCurrency(amount)}
		</span>
		<span className="text-muted-foreground text-xs">
			Réparti entre {memberCount} membre{memberCount !== 1 ? 's' : ''}
		</span>
	</div>
)

export const HouseholdSettings = () => {
	const { data: household, isLoading } = useQuery(householdMeOptions())

	const now = new Date()
	const { data: balance } = useQuery({
		...balanceOptions(now.getFullYear(), now.getMonth() + 1),
		enabled: !!household,
	})

	if (!household) {
		return (
			<div className="flex w-full max-w-5xl flex-col gap-6">
				<LoggedOut>
					<Card className="mx-auto w-[90vw] max-w-md">
						<CardContent className="flex flex-col gap-4">
							<h2 className="font-semibold text-lg">Foyer</h2>
							<p className="text-center text-muted-foreground text-sm">
								Connectez-vous pour gérer votre foyer
							</p>
						</CardContent>
					</Card>
				</LoggedOut>

				<LoggedIn>
					{isLoading ? (
						<Card className="mx-auto w-[90vw] max-w-md">
							<CardContent className="flex items-center justify-center py-12">
								<Loader />
							</CardContent>
						</Card>
					) : (
						<Card className="mx-auto w-[90vw] max-w-md">
							<CardContent className="flex flex-col gap-4">
								<h2 className="font-semibold text-lg">Foyer</h2>
								<CreateHouseholdForm />
							</CardContent>
						</Card>
					)}
				</LoggedIn>
			</div>
		)
	}

	const memberCount = household.members.length

	return (
		<div className="flex w-full max-w-5xl flex-col gap-6">
			{balance && <ShareCard amount={balance.householdShare.total} memberCount={memberCount} />}

			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardContent className="flex flex-col gap-4">
						<div className="flex items-center gap-2">
							<Users className="text-muted-foreground" size={18} />
							<h3 className="font-semibold text-base">Membres</h3>
						</div>

						<div className="flex flex-col gap-1">
							<span className="font-medium text-xl">{household.name}</span>
							<span className="text-muted-foreground text-xs">
								{memberCount} membre{memberCount !== 1 ? 's' : ''}
							</span>
						</div>

						<SplitModeToggle currentMode={household.splitMode} householdId={household.id} />

						<Separator />

						<MemberList members={household.members} />

						<Separator />

						<InviteForm />

						<PendingInvitations />

						<Separator />

						<LeaveHouseholdButton householdId={household.id} householdName={household.name} />
					</CardContent>
				</Card>

				<Card>
					<CardContent className="flex flex-col gap-4">
						<div className="flex items-center gap-2">
							<Wallet className="text-muted-foreground" size={18} />
							<h3 className="font-semibold text-base">Dépenses partagées</h3>
						</div>

						<AddHouseholdExpenseForm />

						<Separator />

						<HouseholdExpenseList memberCount={memberCount} splitMode={household.splitMode} />
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
