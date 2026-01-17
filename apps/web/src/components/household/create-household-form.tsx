import { useMutation } from '@tanstack/react-query'
import z from 'zod'
import { useAppForm } from '~/lib/hooks/form-hook'
import { createHouseholdOptions } from '~/lib/mutations/households.mutations'

const createSchema = z.object({
	name: z.string().nonempty('Nom requis'),
})

type CreateFormValues = z.infer<typeof createSchema>

const defaultValues: CreateFormValues = { name: '' }

export const CreateHouseholdForm = () => {
	const { isPending, mutate, error } = useMutation(createHouseholdOptions())

	const form = useAppForm({
		defaultValues,
		validators: {
			onChange: createSchema,
			onMount: createSchema,
			onSubmit: createSchema,
		},
		onSubmit: ({ value }) => {
			mutate({ name: value.name.trim() })
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

				{error && (
					<p className="text-destructive text-xs">
						{(error as { error?: string })?.error || 'Échec de la création du foyer'}
					</p>
				)}

				<form.AppForm>
					<form.SubmitButton disabled={isPending} label="Créer le foyer" />
				</form.AppForm>
			</form>
		</div>
	)
}
