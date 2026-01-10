import { ExpensePeriod, ExpenseType } from '@repo/db/types'
import z from 'zod'
import { withForm } from '~/lib/hooks/form-hook'

const typeOptions = ExpenseType.map((t) => ({
	value: t,
	label: t === 'one_time' ? 'One-time' : 'Recurring',
}))

const periodOptions = ExpensePeriod.map((p) => ({
	value: p,
	label: p.charAt(0).toUpperCase() + p.slice(1),
}))

export const expenseFormSchema = z
	.object({
		name: z.string().nonempty('Name is required'),
		amount: z.string().nonempty('Amount is required'),
		type: z.enum(ExpenseType),
		period: z.enum(ExpensePeriod).optional(),
		startDate: z.string(),
		endDate: z.string(),
		targetDate: z.string(),
	})
	.refine(
		(data) => {
			if (data.type === 'one_time') return !!data.targetDate
			return !!data.period && !!data.startDate
		},
		{ message: 'One-time needs date, recurring needs period + start date' }
	)

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>

export const defaultExpenseValues: ExpenseFormValues = {
	name: '',
	amount: '',
	type: 'recurring',
	period: 'monthly',
	startDate: new Date().toISOString().slice(0, 10),
	endDate: '',
	targetDate: new Date().toISOString().slice(0, 10),
}

export const ExpenseFields = withForm({
	defaultValues: defaultExpenseValues,
	render: ({ form }) => (
		<div className="flex flex-col gap-4">
			<form.AppField name="name">{(field) => <field.TextField label="Name" />}</form.AppField>

			<form.AppField name="amount">
				{(field) => <field.TextField label="Amount (€)" type="number" />}
			</form.AppField>

			<form.AppField name="type">
				{(field) => <field.SelectField label="Type" options={typeOptions} />}
			</form.AppField>

			<form.Subscribe selector={(state) => state.values.type}>
				{(type) =>
					type === 'one_time' ? (
						<form.AppField name="targetDate">
							{(field) => <field.TextField label="Date" type="date" />}
						</form.AppField>
					) : (
						<>
							<form.AppField name="period">
								{(field) => <field.SelectField label="Period" options={periodOptions} />}
							</form.AppField>

							<div className="flex gap-2">
								<div className="flex-1">
									<form.AppField name="startDate">
										{(field) => <field.TextField label="Start Date" type="date" />}
									</form.AppField>
								</div>
								<div className="flex-1">
									<form.AppField name="endDate">
										{(field) => <field.TextField label="End Date (optional)" type="date" />}
									</form.AppField>
								</div>
							</div>
						</>
					)
				}
			</form.Subscribe>
		</div>
	),
})
