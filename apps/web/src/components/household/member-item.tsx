import { User } from 'lucide-react'

type MemberItemProps = {
	member: {
		user: { _id: string; name: string | undefined; email: string | undefined }
		joinedAt: number
	}
	isCurrentUser: boolean
}

export const MemberItem = ({ member, isCurrentUser }: MemberItemProps) => (
	<div className="flex items-center gap-3">
		<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
			<User className="text-muted-foreground" size={16} />
		</div>
		<div className="flex min-w-0 flex-1 flex-col">
			<span className="truncate font-medium text-sm">
				{member.user.name ?? 'Membre'}
				{isCurrentUser && <span className="text-muted-foreground"> (vous)</span>}
			</span>
			<span className="truncate text-muted-foreground text-xs">{member.user.email}</span>
		</div>
	</div>
)
