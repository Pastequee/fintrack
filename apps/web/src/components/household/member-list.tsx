import { useAuth } from '~/lib/hooks/use-auth'
import { MemberItem } from './member-item'

type Member = {
	user: { id: string; name: string; email: string } | null
	joinedAt: Date
}

type MemberListProps = {
	members: Member[]
}

export const MemberList = ({ members }: MemberListProps) => {
	const { user } = useAuth()
	const currentUserId = user?.id

	const validMembers = members.filter(
		(m): m is Member & { user: NonNullable<Member['user']> } => m.user !== null
	)

	if (validMembers.length === 0) return null

	return (
		<div className="flex flex-col gap-3">
			<h3 className="font-medium text-sm">Membres</h3>
			<div className="flex flex-col gap-2">
				{validMembers.map((member) => (
					<MemberItem
						isCurrentUser={member.user.id === currentUserId}
						key={member.user.id}
						member={member}
					/>
				))}
			</div>
		</div>
	)
}
