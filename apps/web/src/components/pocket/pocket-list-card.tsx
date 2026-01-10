import { LoggedIn } from '../auth/logged-in'
import { LoggedOut } from '../auth/logged-out'
import { Card, CardContent } from '../ui/card'
import { Separator } from '../ui/separator'
import { AddPocketForm } from './add-pocket-form'
import { PocketList } from './pocket-list'

export const PocketListCard = () => (
	<Card className="mx-auto w-[90vw] max-w-md">
		<CardContent className="flex flex-col gap-4">
			<h2 className="font-semibold text-lg">Pockets</h2>
			<LoggedOut>
				<p className="text-center text-muted-foreground text-sm">
					You must be logged in to manage pockets
				</p>
			</LoggedOut>
			<AddPocketForm />
			<LoggedIn>
				<Separator className="last:hidden" />
				<PocketList />
			</LoggedIn>
		</CardContent>
	</Card>
)
