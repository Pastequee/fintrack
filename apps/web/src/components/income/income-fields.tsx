import type { Doc } from '@repo/convex/_generated/dataModel'
import { z } from 'zod'
import { withForm } from '~/lib/hooks/form-hook'

const IncomePeriod = ['daily', 'weekly', 'monthly', 'yearly'] as const

const periodLabels: Record<string, string> = {
	daily: 'Quotidien',
	weekly: 'Hebdomadaire',
	monthly: 'Mensuel',
	yearly: 'Annuel',
}

const periodOptions = IncomePeriod.map((p) => ({
	value: p,
	label: periodLabels[p] ?? p,
}))

export const incomeFormSchema = z.object({
	name: z.string().nonempty('Nom requis'),
	amount: z.string().nonempty('Montant requis'),
	period: z.enum(IncomePeriod),
	startDate: z.string().nonempty('Date de début requise'),
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

export function toConvexIncomePayload(value: IncomeFormValues) {
	return {
		name: value.name.trim(),
		amount: Number(value.amount),
		period: value.period,
		startDate: value.startDate,
		endDate: value.endDate || undefined,
	}
}

export function incomeToFormValues(income: Doc<'incomes'>): IncomeFormValues {
	return {
		name: income.name,
		amount: String(income.amount),
		period: income.period,
		startDate: income.startDate,
		endDate: income.endDate ?? '',
	}
}

export const IncomeFields = withForm({
	defaultValues: defaultIncomeValues,
	render: ({ form }) => (
		<div className="flex flex-col gap-4">
			<form.AppField name="name">{(field) => <field.TextField label="Nom" />}</form.AppField>

			<form.AppField name="amount">
				{(field) => <field.TextField label="Montant (€)" type="number" />}
			</form.AppField>

			<form.AppField name="period">
				{(field) => <field.SelectField label="Période" options={periodOptions} />}
			</form.AppField>

			<div className="flex gap-2">
				<div className="flex-1">
					<form.AppField name="startDate">
						{(field) => <field.TextField label="Date de début" type="date" />}
					</form.AppField>
				</div>
				<div className="flex-1">
					<form.AppField name="endDate">
						{(field) => <field.TextField label="Date de fin (optionnel)" type="date" />}
					</form.AppField>
				</div>
			</div>
		</div>
	),
})
