import type { Income } from '@repo/db/types'
import { IncomePeriod as IncomePeriodValues } from '@repo/db/types'
import z from 'zod'
import { useAppForm } from '~/lib/hooks/form-hook'

const periodOptions = IncomePeriodValues.map((p) => ({
	value: p,
	label: p.charAt(0).toUpperCase() + p.slice(1),
}))

const incomeFormSchema = z.object({
	name: z.string().nonempty('Name is required'),
	amount: z.string().nonempty('Amount is required'),
	period: z.enum(IncomePeriodValues),
	startDate: z.string().nonempty('Start date is required'),
	endDate: z.string(),
})

export type IncomeFormValues = z.infer<typeof incomeFormSchema>

type IncomeFormProps = {
	income?: Income
	onSubmit: (values: IncomeFormValues) => Promise<void> | void
	onSuccess?: () => void
	isPending?: boolean
	submitLabel: string
	disabled?: boolean
}

const todayDate = () => new Date().toISOString().slice(0, 10)

const getDefaultValues = (income?: Income): IncomeFormValues => ({
	name: income?.name ?? '',
	amount: income?.amount ?? '',
	period: income?.period ?? 'monthly',
	startDate: income?.startDate ?? todayDate(),
	endDate: income?.endDate ?? '',
})

export const IncomeForm = ({
	income,
	onSubmit,
	onSuccess,
	isPending,
	submitLabel,
	disabled,
}: IncomeFormProps) => {
	const form = useAppForm({
		defaultValues: getDefaultValues(income),
		validators: {
			onChange: incomeFormSchema,
			onMount: incomeFormSchema,
			onSubmit: incomeFormSchema,
		},
		onSubmit: async ({ value }) => {
			await onSubmit(value)
			onSuccess?.()
		},
	})

	return (
		<form
			className="flex flex-col gap-4"
			onSubmit={(e) => {
				e.preventDefault()
				form.handleSubmit()
			}}
		>
			<form.AppField name="name">
				{(field) => <field.TextField disabled={disabled} label="Name" />}
			</form.AppField>

			<form.AppField name="amount">
				{(field) => <field.TextField disabled={disabled} label="Amount (€)" type="number" />}
			</form.AppField>

			<form.AppField name="period">
				{(field) => (
					<field.SelectField disabled={disabled} label="Period" options={periodOptions} />
				)}
			</form.AppField>

			<div className="flex gap-2">
				<div className="flex-1">
					<form.AppField name="startDate">
						{(field) => <field.TextField disabled={disabled} label="Start Date" type="date" />}
					</form.AppField>
				</div>
				<div className="flex-1">
					<form.AppField name="endDate">
						{(field) => (
							<field.TextField disabled={disabled} label="End Date (optional)" type="date" />
						)}
					</form.AppField>
				</div>
			</div>

			<form.AppForm>
				<form.SubmitButton disabled={isPending} label={submitLabel} />
			</form.AppForm>
		</form>
	)
}
