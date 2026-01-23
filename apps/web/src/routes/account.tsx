import { useAuthActions } from '@convex-dev/auth/react'
import { api } from '@repo/convex/_generated/api'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import z from 'zod'
import { LogoutButton } from '~/components/auth/logout-button'
import { Footer } from '~/components/footer'
import { Navbar } from '~/components/navigation/navbar'
import { Alert, AlertTitle } from '~/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { PasswordInput } from '~/components/ui/password-input'
import { useAppForm } from '~/lib/hooks/form-hook'
import { useAuth } from '~/lib/hooks/use-auth'

export const Route = createFileRoute('/account')({
	component: Account,
})

function Account() {
	const { user, isLoading, isAuthenticated } = useAuth()
	const navigate = useNavigate()

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			navigate({ to: '/login', search: { redirect: '/account' }, replace: true })
		}
	}, [isLoading, isAuthenticated, navigate])

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-muted-foreground">Chargement...</div>
			</div>
		)
	}

	if (!user) return null

	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />
			<main className="flex flex-1 flex-col items-center gap-6 px-4 py-8">
				<div className="w-full max-w-3xl space-y-6">
					<h1 className="font-bold text-2xl">Paramètres du compte</h1>

					<div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
						{/* Left column: Profile + Email */}
						<div className="space-y-6">
							<ProfileForm defaultName={user.name ?? ''} />
							<EmailCard currentEmail={user.email ?? ''} />
						</div>

						{/* Right column: Password + Session */}
						<div className="space-y-6">
							<PasswordForm email={user.email ?? ''} />
							<Card>
								<CardHeader>
									<CardTitle>Session</CardTitle>
									<CardDescription>Gérer votre session actuelle</CardDescription>
								</CardHeader>
								<CardContent>
									<LogoutButton />
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</div>
	)
}

const profileSchema = z.object({
	name: z.string().nonempty('Le nom est requis'),
})

function ProfileForm({ defaultName }: { defaultName: string }) {
	const [error, setError] = useState<string>()
	const updateProfile = useMutation(api.users.updateProfile)

	const form = useAppForm({
		defaultValues: { name: defaultName },
		validators: { onChange: profileSchema, onMount: profileSchema, onSubmit: profileSchema },
		onSubmit: async ({ value }) => {
			setError(undefined)

			try {
				await updateProfile({ name: value.name })
				toast.success('Profil mis à jour avec succès')
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Échec de la mise à jour du profil')
			}
		},
	})

	return (
		<Card>
			<CardHeader>
				<CardTitle>Profil</CardTitle>
				<CardDescription>Modifier votre nom d'affichage</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					className="flex flex-col gap-4"
					onSubmit={(e) => {
						e.preventDefault()
						form.handleSubmit()
					}}
				>
					{error && (
						<Alert variant="destructive">
							<AlertCircle />
							<AlertTitle>{error}</AlertTitle>
						</Alert>
					)}

					<form.AppField name="name">
						{(field) => <field.TextField autoComplete="name" label="Nom" />}
					</form.AppField>

					<form.AppForm>
						<form.SubmitButton label="Mettre à jour le profil" />
					</form.AppForm>
				</form>
			</CardContent>
		</Card>
	)
}

function EmailCard({ currentEmail }: { currentEmail: string }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Email</CardTitle>
				<CardDescription>
					Email actuel : <span className="font-medium">{currentEmail}</span>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="text-muted-foreground text-sm">
					Le changement d'email n'est pas disponible pour le moment.
				</p>
			</CardContent>
		</Card>
	)
}

const passwordSchema = z
	.object({
		newPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
		confirmPassword: z.string().nonempty('Veuillez confirmer votre mot de passe'),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Les mots de passe ne correspondent pas',
		path: ['confirmPassword'],
	})

function PasswordForm({ email }: { email: string }) {
	const [error, setError] = useState<string>()
	const { signIn } = useAuthActions()

	const form = useAppForm({
		defaultValues: { newPassword: '', confirmPassword: '' },
		validators: { onChange: passwordSchema, onMount: passwordSchema, onSubmit: passwordSchema },
		onSubmit: async ({ value }) => {
			setError(undefined)

			try {
				// Convex Auth Password provider: signUp with existing email updates password
				await signIn('password', {
					email,
					password: value.newPassword,
					flow: 'signUp',
				})
				toast.success('Mot de passe modifié avec succès')
				form.reset()
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Échec du changement de mot de passe')
			}
		},
	})

	return (
		<Card>
			<CardHeader>
				<CardTitle>Mot de passe</CardTitle>
				<CardDescription>Modifier votre mot de passe</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					className="flex flex-col gap-4"
					onSubmit={(e) => {
						e.preventDefault()
						form.handleSubmit()
					}}
				>
					{error && (
						<Alert variant="destructive">
							<AlertCircle />
							<AlertTitle>{error}</AlertTitle>
						</Alert>
					)}

					<form.AppField name="newPassword">
						{(field) => (
							<field.TextField
								autoComplete="new-password"
								input={PasswordInput}
								label="Nouveau mot de passe"
							/>
						)}
					</form.AppField>

					<form.AppField name="confirmPassword">
						{(field) => (
							<field.TextField
								autoComplete="new-password"
								input={PasswordInput}
								label="Confirmer le nouveau mot de passe"
							/>
						)}
					</form.AppField>

					<form.AppForm>
						<form.SubmitButton label="Changer le mot de passe" />
					</form.AppForm>
				</form>
			</CardContent>
		</Card>
	)
}
