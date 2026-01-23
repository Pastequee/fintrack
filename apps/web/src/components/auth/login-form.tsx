import { useAuthActions } from '@convex-dev/auth/react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import z from 'zod'
import googleIcon from '~/assets/google.svg'
import { Alert, AlertTitle } from '~/components/ui/alert'
import { useAppForm } from '~/lib/hooks/form-hook'
import { Button } from '../ui/button'
import { PasswordInput } from '../ui/password-input'
import { Separator } from '../ui/separator'

const formSchema = z.object({
	email: z.email('Adresse email invalide'),
	password: z.string().nonempty('Le mot de passe est requis'),
})

export function LoginForm() {
	const navigate = useNavigate({ from: '/login' })
	const { redirect } = useSearch({ from: '/_auth' })
	const [errorMessage, setErrorMessage] = useState<string>()
	const { signIn } = useAuthActions()

	const form = useAppForm({
		defaultValues: { email: '', password: '' },
		defaultState: { canSubmit: false },
		validators: { onChange: formSchema, onMount: formSchema, onSubmit: formSchema },
		onSubmit: async ({ value }) => {
			try {
				await signIn('password', {
					email: value.email,
					password: value.password,
					flow: 'signIn',
				})
				navigate({ to: redirect ?? '/', replace: true })
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Une erreur est survenue'
				setErrorMessage(message)
			}
		},
	})

	async function handleGoogleSignIn() {
		try {
			await signIn('google')
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Une erreur est survenue'
			setErrorMessage(message)
		}
	}

	return (
		<form
			className="flex flex-col gap-4"
			noValidate
			onSubmit={(e) => {
				e.preventDefault()
				e.stopPropagation()
				form.handleSubmit()
			}}
		>
			{errorMessage && (
				<Alert variant="destructive">
					<AlertCircle />
					<AlertTitle>{errorMessage}</AlertTitle>
				</Alert>
			)}

			<form.AppField
				children={(field) => <field.TextField autoComplete="email" label="Email" type="email" />}
				name="email"
			/>

			<form.AppField
				children={(field) => (
					<field.TextField
						autoComplete="current-password"
						input={PasswordInput}
						label="Mot de passe"
					/>
				)}
				name="password"
			/>

			<form.AppForm>
				<form.SubmitButton label="Se connecter" />
			</form.AppForm>

			<div className="my-2 flex items-center gap-4">
				<Separator className="flex-1" />
				<span className="text-muted-foreground text-sm">OU</span>
				<Separator className="flex-1" />
			</div>

			<Button className="w-full" onClick={handleGoogleSignIn} variant="outline">
				<img alt="Google" className="size-4" height={16} src={googleIcon} width={16} />
				Continuer avec Google
			</Button>
		</form>
	)
}
