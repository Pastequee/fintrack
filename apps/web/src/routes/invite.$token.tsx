import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AlertCircle, Home, Users } from 'lucide-react'
import { useState } from 'react'
import { Footer } from '~/components/footer'
import { Navbar } from '~/components/navigation/navbar'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Loader } from '~/components/ui/loader'
import { useAuth } from '~/lib/hooks/use-auth'
import {
	acceptInvitationOptions,
	declineInvitationOptions,
} from '~/lib/mutations/households.mutations'
import { invitationByTokenOptions } from '~/lib/queries/households.queries'

export const Route = createFileRoute('/invite/$token')({
	component: InvitationPage,
})

function getErrorMessage(err: unknown, fallback: string) {
	return err instanceof Error ? err.message : fallback
}

function InvitationPage() {
	const { token } = Route.useParams()
	const navigate = useNavigate()
	const auth = useAuth()
	const [error, setError] = useState<string | null>(null)

	const { data: invitation, isLoading, isError } = useQuery(invitationByTokenOptions(token))

	const acceptMutation = useMutation({
		...acceptInvitationOptions(token),
		onSuccess: () => navigate({ to: '/' }),
		onError: (err) => {
			const message = getErrorMessage(err, 'Failed to accept invitation')
			if (message.includes('Already a member')) {
				setError('You are already a member of a household. Leave your current household first.')
			} else {
				setError(message)
			}
		},
	})

	const declineMutation = useMutation({
		...declineInvitationOptions(token),
		onSuccess: () => navigate({ to: '/' }),
		onError: (err) => setError(getErrorMessage(err, 'Failed to decline invitation')),
	})

	const isPending = acceptMutation.isPending || declineMutation.isPending
	const isInvalidInvitation = isError || !invitation || !invitation.household

	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />
			<main className="flex flex-1 items-center justify-center">
				<Card className="mx-auto w-[90vw] max-w-md">
					<CardContent className="flex flex-col gap-4">
						<div className="flex items-center gap-2">
							<Users className="size-5" />
							<h2 className="font-semibold text-lg">Household Invitation</h2>
						</div>

						{isLoading && <Loader className="text-muted-foreground" />}

						{!isLoading && isInvalidInvitation && (
							<InvalidInvitation onGoHome={() => navigate({ to: '/' })} />
						)}

						{!isLoading && invitation?.household && (
							<InvitationDetails
								error={error}
								householdName={invitation.household.name}
								inviterName={invitation.inviter?.name || invitation.inviter?.email}
								isAccepting={acceptMutation.isPending}
								isAuthenticated={!!auth}
								isDeclining={declineMutation.isPending}
								isPending={isPending}
								onAccept={() => acceptMutation.mutate({})}
								onDecline={() => declineMutation.mutate({})}
								onLogin={() => navigate({ to: '/login' })}
							/>
						)}
					</CardContent>
				</Card>
			</main>
			<Footer />
		</div>
	)
}

type InvalidInvitationProps = {
	onGoHome: () => void
}

function InvalidInvitation({ onGoHome }: InvalidInvitationProps) {
	return (
		<div className="flex flex-col gap-4">
			<Alert variant="destructive">
				<AlertCircle className="size-4" />
				<AlertTitle>Invalid Invitation</AlertTitle>
				<AlertDescription>
					This invitation link is invalid, expired, or has already been used.
				</AlertDescription>
			</Alert>
			<Button onClick={onGoHome} variant="outline">
				<Home className="size-4" />
				Go Home
			</Button>
		</div>
	)
}

type InvitationDetailsProps = {
	householdName: string
	inviterName: string | undefined
	error: string | null
	isAuthenticated: boolean
	isPending: boolean
	isAccepting: boolean
	isDeclining: boolean
	onAccept: () => void
	onDecline: () => void
	onLogin: () => void
}

function InvitationDetails({
	householdName,
	inviterName,
	error,
	isAuthenticated,
	isPending,
	isAccepting,
	isDeclining,
	onAccept,
	onDecline,
	onLogin,
}: InvitationDetailsProps) {
	return (
		<>
			<div className="flex flex-col gap-2 rounded-lg border p-4">
				<p className="text-muted-foreground text-sm">You've been invited to join</p>
				<p className="font-medium text-xl">{householdName}</p>
				{inviterName && <p className="text-muted-foreground text-sm">Invited by {inviterName}</p>}
			</div>

			{error && (
				<Alert variant="destructive">
					<AlertCircle className="size-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{isAuthenticated ? (
				<div className="flex gap-2">
					<Button className="flex-1" disabled={isPending} onClick={onDecline} variant="outline">
						{isDeclining ? 'Declining...' : 'Decline'}
					</Button>
					<Button className="flex-1" disabled={isPending} onClick={onAccept}>
						{isAccepting ? 'Accepting...' : 'Accept'}
					</Button>
				</div>
			) : (
				<div className="flex flex-col gap-2">
					<p className="text-center text-muted-foreground text-sm">
						Please log in to accept this invitation
					</p>
					<Button onClick={onLogin}>Log In</Button>
				</div>
			)}
		</>
	)
}
