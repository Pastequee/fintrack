import z from 'zod'
import { withFieldGroup } from '~/lib/hooks/form-hook'

export const pocketFormSchema = z.object({
	name: z.string().nonempty('Name is required'),
	amount: z.string().nonempty('Amount is required'),
})

export type PocketFormValues = z.infer<typeof pocketFormSchema>

export const defaultPocketValues: PocketFormValues = {
	name: '',
	amount: '',
}

export const PocketFields = withFieldGroup({
	defaultValues: defaultPocketValues,
	render: ({ group }) => (
		<div className="flex flex-col gap-4">
			<group.AppField name="name">{(field) => <field.TextField label="Name" />}</group.AppField>

			<group.AppField name="amount">
				{(field) => <field.TextField label="Amount (€)" type="number" />}
			</group.AppField>
		</div>
	),
})
