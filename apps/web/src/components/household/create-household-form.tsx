import { api } from '@repo/convex/_generated/api'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import z from 'zod'
import { useAppForm } from '~/lib/hooks/form-hook'

const createSchema = z.object({
	name: z.string().nonempty('Nom requis'),
})

type CreateFormValues = z.infer<typeof createSchema>

const defaultValues: CreateFormValues = { name: '' }

export const CreateHouseholdForm = () => {
	const createMutation = useMutation(api.households.create)
	const [isPending, setIsPending] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const form = useAppForm({
		defaultValues,
		validators: {
			onChange: createSchema,
			onMount: createSchema,
			onSubmit: createSchema,
		},
		onSubmit: async ({ value }) => {
			setIsPending(true)
			setError(null)
			try {
				await createMutation({ name: value.name.trim(), splitMode: 'equal' })
			} catch (e) {
				setError(e instanceof Error ? e.message : 'Échec de la création du foyer')
			} finally {
				setIsPending(false)
			}
		},
	})

	return (
		<div className="flex flex-col gap-4">
			<p className="text-center text-muted-foreground text-sm">
				Vous n&apos;avez pas encore de foyer. Créez-en un pour partager vos dépenses.
			</p>
			<form
				className="flex flex-col gap-4"
				onSubmit={(e) => {
					e.preventDefault()
					form.handleSubmit()
				}}
			>
				<form.AppField name="name">
					{(field) => <field.TextField label="Nom du foyer" />}
				</form.AppField>

				{error && <p className="text-destructive text-xs">{error}</p>}

				<form.AppForm>
					<form.SubmitButton disabled={isPending} label="Créer le foyer" />
				</form.AppForm>
			</form>
		</div>
	)
}
