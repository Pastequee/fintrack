import type { Id } from '@repo/convex/_generated/dataModel'
import { Button } from '~/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '~/components/ui/dialog'

type AdminUser = {
	id: Id<'users'>
	name?: string
	email?: string
}

type Props = {
	user: AdminUser
	open: boolean
	onOpenChange: (open: boolean) => void
	onSuccess: () => void
}

// Admin password reset not supported with Convex Auth
// Users should use password reset flow instead
export function ChangePasswordDialog({ user, open, onOpenChange }: Props) {
	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Change Password</DialogTitle>
					<DialogDescription>
						Cannot change password for <span className="font-medium">{user.email}</span>
					</DialogDescription>
				</DialogHeader>

				<p className="text-muted-foreground text-sm">
					Admin password reset is not available. The user should use the password reset feature on
					the login page.
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
