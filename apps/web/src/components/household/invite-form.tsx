import { api } from '@repo/convex/_generated/api'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import z from 'zod'
import { useAppForm } from '~/lib/hooks/form-hook'

const inviteSchema = z.object({
	email: z.string().email('Email valide requis'),
})

type InviteFormValues = z.infer<typeof inviteSchema>

const defaultValues: InviteFormValues = { email: '' }

export const InviteForm = () => {
	const sendMutation = useMutation(api.invitations.send)
	const [isPending, setIsPending] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const form = useAppForm({
		defaultValues,
		validators: {
			onChange: inviteSchema,
			onMount: inviteSchema,
			onSubmit: inviteSchema,
		},
		onSubmit: async ({ value }) => {
			setIsPending(true)
			setError(null)
			try {
				await sendMutation({ email: value.email.trim().toLowerCase() })
				form.reset()
			} catch (e) {
				setError(e instanceof Error ? e.message : "Échec de l'envoi de l'invitation")
			} finally {
				setIsPending(false)
			}
		},
	})

	return (
		<div className="flex flex-col gap-3">
			<h3 className="font-medium text-sm">Inviter un membre</h3>
			<form
				className="flex flex-col gap-3"
				onSubmit={(e) => {
					e.preventDefault()
					form.handleSubmit()
				}}
			>
				<form.AppField name="email">
					{(field) => <field.TextField label="Email" type="email" />}
				</form.AppField>

				{error && <p className="text-destructive text-xs">{error}</p>}

				<form.AppForm>
					<form.SubmitButton disabled={isPending} label="Envoyer l'invitation" />
				</form.AppForm>
			</form>
		</div>
	)
}
