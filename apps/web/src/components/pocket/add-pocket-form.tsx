import { useMutation } from '@tanstack/react-query'
import { useAppForm } from '~/lib/hooks/form-hook'
import { createPocketOptions } from '~/lib/mutations/pockets.mutations'
import { LoggedIn } from '../auth/logged-in'
import { defaultPocketValues, PocketFields, pocketFormSchema } from './pocket-fields'

export const AddPocketForm = () => {
	const { isPending, mutate } = useMutation(createPocketOptions())

	const form = useAppForm({
		defaultValues: defaultPocketValues,
		validators: {
			onChange: pocketFormSchema,
			onMount: pocketFormSchema,
			onSubmit: pocketFormSchema,
		},
		onSubmit: ({ value }) => {
			mutate(
				{
					name: value.name.trim(),
					amount: value.amount,
				},
				{ onSuccess: () => form.reset() }
			)
		},
	})

	return (
		<LoggedIn>
			<form
				className="flex flex-col gap-4"
				onSubmit={(e) => {
					e.preventDefault()
					form.handleSubmit()
				}}
			>
				<PocketFields
					fields={{
						name: 'name',
						amount: 'amount',
					}}
					form={form}
				/>

				<form.AppForm>
					<form.SubmitButton disabled={isPending} label="Add Pocket" />
				</form.AppForm>
			</form>
		</LoggedIn>
	)
}
