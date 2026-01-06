import { IncomePeriod } from '@repo/db/types'
import z from 'zod'
import { withFieldGroup } from '~/lib/hooks/form-hook'

const periodOptions = IncomePeriod.map((p) => ({
	value: p,
	label: p.charAt(0).toUpperCase() + p.slice(1),
}))

export const incomeFormSchema = z.object({
	name: z.string().nonempty('Name is required'),
	amount: z.string().nonempty('Amount is required'),
	period: z.enum(IncomePeriod),
	startDate: z.string().nonempty('Start date is required'),
	endDate: z.string(),
})

export type IncomeFormValues = z.infer<typeof incomeFormSchema>

export const defaultIncomeValues: IncomeFormValues = {
	name: '',
	amount: '',
	period: 'monthly',
	startDate: new Date().toISOString().slice(0, 10),
	endDate: '',
}

export const IncomeFields = withFieldGroup({
	defaultValues: defaultIncomeValues,
	render: ({ group }) => (
		<div className="flex flex-col gap-4">
			<group.AppField name="name">{(field) => <field.TextField label="Name" />}</group.AppField>

			<group.AppField name="amount">
				{(field) => <field.TextField label="Amount (€)" type="number" />}
			</group.AppField>

			<group.AppField name="period">
				{(field) => <field.SelectField label="Period" options={periodOptions} />}
			</group.AppField>

			<div className="flex gap-2">
				<div className="flex-1">
					<group.AppField name="startDate">
						{(field) => <field.TextField label="Start Date" type="date" />}
					</group.AppField>
				</div>
				<div className="flex-1">
					<group.AppField name="endDate">
						{(field) => <field.TextField label="End Date (optional)" type="date" />}
					</group.AppField>
				</div>
			</div>
		</div>
	),
})
