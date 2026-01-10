import { useMutation } from '@tanstack/react-query'
import z from 'zod'
import { useAppForm } from '~/lib/hooks/form-hook'
import { sendInvitationOptions } from '~/lib/mutations/households.mutations'

const inviteSchema = z.object({
	email: z.string().email('Valid email required'),
})

type InviteFormValues = z.infer<typeof inviteSchema>

const defaultValues: InviteFormValues = { email: '' }

export const InviteForm = () => {
	const { isPending, mutate, error } = useMutation(sendInvitationOptions())

	const form = useAppForm({
		defaultValues,
		validators: {
			onChange: inviteSchema,
			onMount: inviteSchema,
			onSubmit: inviteSchema,
		},
		onSubmit: ({ value }) => {
			mutate({ email: value.email.trim().toLowerCase() }, { onSuccess: () => form.reset() })
		},
	})

	return (
		<div className="flex flex-col gap-3">
			<h3 className="font-medium text-sm">Invite Member</h3>
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

				{error && (
					<p className="text-destructive text-xs">
						{(error as { error?: string })?.error || 'Failed to send invitation'}
					</p>
				)}

				<form.AppForm>
					<form.SubmitButton disabled={isPending} label="Send Invite" />
				</form.AppForm>
			</form>
		</div>
	)
}
