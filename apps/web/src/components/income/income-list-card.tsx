import { LoggedIn } from '../auth/logged-in'
import { LoggedOut } from '../auth/logged-out'
import { Card, CardContent } from '../ui/card'
import { Separator } from '../ui/separator'
import { AddIncomeForm } from './add-income-form'
import { IncomeList } from './income-list'

export const IncomeListCard = () => (
	<Card className="mx-auto w-[90vw] max-w-md">
		<CardContent className="flex flex-col gap-4">
			<h2 className="font-semibold text-lg">Revenus</h2>
			<LoggedOut>
				<p className="text-center text-muted-foreground text-sm">
					Connectez-vous pour gérer vos revenus
				</p>
			</LoggedOut>
			<AddIncomeForm />
			<LoggedIn>
				<Separator className="last:hidden" />
				<IncomeList />
			</LoggedIn>
		</CardContent>
	</Card>
)
