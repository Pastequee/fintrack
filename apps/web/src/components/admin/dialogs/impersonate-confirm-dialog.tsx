import type { Id } from '@repo/convex/_generated/dataModel'
import { AlertTriangle } from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '~/components/ui/dialog'

type UserWithRole = {
	id: Id<'users'>
	name: string
	email: string
}

type Props = {
	user: UserWithRole
	open: boolean
	onOpenChange: (open: boolean) => void
}

// Impersonation not supported with Convex Auth
export function ImpersonateConfirmDialog({ user, open, onOpenChange }: Props) {
	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<AlertTriangle className="size-5 text-amber-500" />
						Impersonate User
					</DialogTitle>
					<DialogDescription>
						Cannot impersonate <span className="font-medium">{user.email}</span>
					</DialogDescription>
				</DialogHeader>

				<p className="text-muted-foreground text-sm">
					User impersonation is not available with the current authentication system.
				</p>

				<DialogFooter>
					<Button onClick={() => onOpenChange(false)} variant="outline">
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
