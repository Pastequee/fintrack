import type { Pocket } from '@repo/db/types'
import { useMutation } from '@tanstack/react-query'
import { useAppForm } from '~/lib/hooks/form-hook'
import { updatePocketOptions } from '~/lib/mutations/pockets.mutations'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { PocketFields, type PocketFormValues, pocketFormSchema } from './pocket-fields'

type EditPocketDialogProps = {
	pocket: Pocket
	open: boolean
	onOpenChange: (open: boolean) => void
}

const pocketToFormValues = (pocket: Pocket): PocketFormValues => ({
	name: pocket.name,
	amount: pocket.amount,
})

export const EditPocketDialog = ({ pocket, open, onOpenChange }: EditPocketDialogProps) => {
	const { isPending, mutate } = useMutation(updatePocketOptions(pocket.id))

	const form = useAppForm({
		defaultValues: pocketToFormValues(pocket),
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
				{ onSuccess: () => onOpenChange(false) }
			)
		},
	})

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Pocket</DialogTitle>
				</DialogHeader>

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
						<form.SubmitButton disabled={isPending} label="Save" />
					</form.AppForm>
				</form>
			</DialogContent>
		</Dialog>
	)
}
