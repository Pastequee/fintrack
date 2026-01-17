import { createFileRoute, redirect } from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import z from 'zod'
import { LogoutButton } from '~/components/auth/logout-button'
import { Footer } from '~/components/footer'
import { Navbar } from '~/components/navigation/navbar'
import { Alert, AlertTitle } from '~/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { PasswordInput } from '~/components/ui/password-input'
import { authClient } from '~/lib/clients/auth-client'
import { useAppForm } from '~/lib/hooks/form-hook'

export const Route = createFileRoute('/account')({
	component: Account,
	beforeLoad: ({ context }) => {
		if (!context.auth) {
			throw redirect({ to: '/login' })
		}

		return { user: context.auth.user }
	},
})

function Account() {
	const { user } = Route.useRouteContext()

	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />
			<main className="flex flex-1 flex-col items-center gap-6 px-4 py-8">
				<div className="w-full max-w-lg space-y-6">
					<h1 className="font-bold text-2xl">Paramètres du compte</h1>

					<ProfileForm defaultName={user.name} />
					<EmailForm currentEmail={user.email} />
					<PasswordForm />

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

	const form = useAppForm({
		defaultValues: { name: defaultName },
		validators: { onChange: profileSchema, onMount: profileSchema, onSubmit: profileSchema },
		onSubmit: async ({ value }) => {
			setError(undefined)

			const result = await authClient.updateUser({
				name: value.name,
			})

			if (result.error) {
				setError(result.error.message ?? 'Échec de la mise à jour du profil')
				return
			}

			toast.success('Profil mis à jour avec succès')
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

const emailSchema = z.object({
	newEmail: z.string().email('Adresse email invalide'),
})

function EmailForm({ currentEmail }: { currentEmail: string }) {
	const [error, setError] = useState<string>()

	const form = useAppForm({
		defaultValues: { newEmail: '' },
		validators: { onChange: emailSchema, onMount: emailSchema, onSubmit: emailSchema },
		onSubmit: async ({ value }) => {
			setError(undefined)

			// Skip if same as current email
			if (value.newEmail === currentEmail) {
				setError("Le nouvel email doit être différent de l'email actuel")
				return
			}

			const result = await authClient.changeEmail({
				newEmail: value.newEmail,
				callbackURL: '/account',
			})

			if (result.error) {
				setError(result.error.message ?? "Échec du changement d'email")
				return
			}

			toast.success('Email de vérification envoyé. Veuillez vérifier votre boîte de réception.')
			form.reset()
		},
	})

	return (
		<Card>
			<CardHeader>
				<CardTitle>Email</CardTitle>
				<CardDescription>
					Email actuel : <span className="font-medium">{currentEmail}</span>
				</CardDescription>
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

					<form.AppField name="newEmail">
						{(field) => <field.TextField autoComplete="email" label="Nouvel email" type="email" />}
					</form.AppField>

					<form.AppForm>
						<form.SubmitButton label="Changer l'email" />
					</form.AppForm>
				</form>
			</CardContent>
		</Card>
	)
}

const passwordSchema = z
	.object({
		currentPassword: z.string().nonempty('Le mot de passe actuel est requis'),
		newPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
		confirmPassword: z.string().nonempty('Veuillez confirmer votre mot de passe'),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Les mots de passe ne correspondent pas',
		path: ['confirmPassword'],
	})

function PasswordForm() {
	const [error, setError] = useState<string>()

	const form = useAppForm({
		defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
		validators: { onChange: passwordSchema, onMount: passwordSchema, onSubmit: passwordSchema },
		onSubmit: async ({ value }) => {
			setError(undefined)

			const result = await authClient.changePassword({
				currentPassword: value.currentPassword,
				newPassword: value.newPassword,
				revokeOtherSessions: true, // Invalidate other sessions for security
			})

			if (result.error) {
				setError(result.error.message ?? 'Échec du changement de mot de passe')
				return
			}

			toast.success('Mot de passe modifié avec succès')
			form.reset()
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

					<form.AppField name="currentPassword">
						{(field) => (
							<field.TextField
								autoComplete="current-password"
								input={PasswordInput}
								label="Mot de passe actuel"
							/>
						)}
					</form.AppField>

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
