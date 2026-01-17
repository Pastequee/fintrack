import { LoggedIn } from '../auth/logged-in'
import { LoggedOut } from '../auth/logged-out'
import { Card, CardContent } from '../ui/card'
import { Separator } from '../ui/separator'
import { AddExpenseForm } from './add-expense-form'
import { ExpenseList } from './expense-list'

export const ExpenseListCard = () => (
	<Card className="mx-auto w-[90vw] max-w-md">
		<CardContent className="flex flex-col gap-4">
			<h2 className="font-semibold text-lg">Dépenses</h2>
			<LoggedOut>
				<p className="text-center text-muted-foreground text-sm">
					Connectez-vous pour gérer vos dépenses
				</p>
			</LoggedOut>
			<AddExpenseForm />
			<LoggedIn>
				<Separator className="last:hidden" />
				<ExpenseList />
			</LoggedIn>
		</CardContent>
	</Card>
)
