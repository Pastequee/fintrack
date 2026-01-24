import { api } from '@repo/convex/_generated/api'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { AlertCircle, Home, Users } from 'lucide-react'
import { useState } from 'react'
import { Footer } from '~/components/footer'
import { Navbar } from '~/components/navigation/navbar'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Loader } from '~/components/ui/loader'
import { useAuth } from '~/lib/hooks/use-auth'

export const Route = createFileRoute('/invite/$token')({
	component: InvitationPage,
})

function getErrorMessage(err: unknown, fallback: string) {
	return err instanceof Error ? err.message : fallback
}

function InvitationPage() {
	const { token } = Route.useParams()
	const navigate = Route.useNavigate()
	const router = useRouter()

	const { user } = useAuth()
	const [error, setError] = useState<string | null>(null)
	const [isAccepting, setIsAccepting] = useState(false)
	const [isDeclining, setIsDeclining] = useState(false)

	const invitation = useQuery(api.invitations.byToken, { token })
	const isLoading = invitation === undefined

	const acceptMutation = useMutation(api.invitations.accept)
	const declineMutation = useMutation(api.invitations.decline)

	const handleAccept = async () => {
		setIsAccepting(true)
		setError(null)
		try {
			await acceptMutation({ token })
			navigate({ to: '/' })
		} catch (err) {
			const message = getErrorMessage(err, "Échec de l'acceptation de l'invitation")
			if (message.includes('Already a member')) {
				setError("Vous êtes déjà membre d'un foyer. Quittez d'abord votre foyer actuel.")
			} else {
				setError(message)
			}
		} finally {
			setIsAccepting(false)
		}
	}

	const handleDecline = async () => {
		setIsDeclining(true)
		setError(null)
		try {
			await declineMutation({ token })
			navigate({ to: '/' })
		} catch (err) {
			setError(getErrorMessage(err, "Échec du refus de l'invitation"))
		} finally {
			setIsDeclining(false)
		}
	}

	const isPending = isAccepting || isDeclining
	const isInvalidInvitation = !isLoading && (!invitation || !invitation.household)

	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />
			<main className="flex flex-1 items-center justify-center">
				<Card className="mx-auto w-[90vw] max-w-md">
					<CardContent className="flex flex-col gap-4">
						<div className="flex items-center gap-2">
							<Users className="size-5" />
							<h2 className="font-semibold text-lg">Invitation au foyer</h2>
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
								isAccepting={isAccepting}
								isAuthenticated={!!user}
								isDeclining={isDeclining}
								isPending={isPending}
								onAccept={handleAccept}
								onDecline={handleDecline}
								onLogin={() =>
									navigate({ to: '/login', search: { redirect: router.state.location.href } })
								}
								onRegister={() =>
									navigate({ to: '/register', search: { redirect: router.state.location.href } })
								}
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
				<AlertTitle>Invitation invalide</AlertTitle>
				<AlertDescription>
					Ce lien d'invitation est invalide, expiré ou a déjà été utilisé.
				</AlertDescription>
			</Alert>
			<Button onClick={onGoHome} variant="outline">
				<Home className="size-4" />
				Retour à l'accueil
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
	onRegister: () => void
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
	onRegister,
}: InvitationDetailsProps) {
	return (
		<>
			<div className="flex flex-col gap-2 rounded-lg border p-4">
				<p className="text-muted-foreground text-sm">Vous avez été invité(e) à rejoindre</p>
				<p className="font-medium text-xl">{householdName}</p>
				{inviterName && (
					<p className="text-muted-foreground text-sm">Invité(e) par {inviterName}</p>
				)}
			</div>

			{error && (
				<Alert variant="destructive">
					<AlertCircle className="size-4" />
					<AlertTitle>Erreur</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			{isAuthenticated ? (
				<div className="flex gap-2">
					<Button className="flex-1" disabled={isPending} onClick={onDecline} variant="outline">
						{isDeclining ? 'Refus en cours...' : 'Refuser'}
					</Button>
					<Button className="flex-1" disabled={isPending} onClick={onAccept}>
						{isAccepting ? 'Acceptation en cours...' : 'Accepter'}
					</Button>
				</div>
			) : (
				<div className="flex flex-col gap-2">
					<p className="text-center text-muted-foreground text-sm">
						Veuillez vous connecter pour accepter cette invitation
					</p>
					<div className="flex gap-2">
						<Button className="flex-1" onClick={onRegister} variant="outline">
							S'inscrire
						</Button>
						<Button className="flex-1" onClick={onLogin}>
							Se connecter
						</Button>
					</div>
				</div>
			)}
		</>
	)
}
