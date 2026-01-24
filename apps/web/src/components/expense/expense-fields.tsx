import type { Doc, Id } from '@repo/convex/_generated/dataModel'
import { z } from 'zod'
import { withForm } from '~/lib/hooks/form-hook'
import { TagSelector } from '../tag/tag-selector'

const ExpenseType = ['one_time', 'recurring'] as const
const ExpensePeriod = ['daily', 'weekly', 'monthly', 'yearly'] as const

const periodLabels: Record<string, string> = {
	daily: 'Quotidien',
	weekly: 'Hebdomadaire',
	monthly: 'Mensuel',
	yearly: 'Annuel',
}

const typeOptions = ExpenseType.map((t) => ({
	value: t,
	label: t === 'one_time' ? 'Ponctuel' : 'Récurrent',
}))

const periodOptions = ExpensePeriod.map((p) => ({
	value: p,
	label: periodLabels[p] ?? p,
}))

export const expenseFormSchema = z
	.object({
		name: z.string().nonempty('Nom requis'),
		amount: z.string().nonempty('Montant requis'),
		type: z.enum(ExpenseType),
		period: z.enum(ExpensePeriod).optional(),
		startDate: z.string(),
		endDate: z.string(),
		targetDate: z.string(),
		tagId: z.string().nullable(),
	})
	.refine(
		(data) => {
			if (data.type === 'one_time') return !!data.targetDate
			return !!data.period && !!data.startDate
		},
		{ message: 'Ponctuel nécessite une date, récurrent nécessite période + date début' }
	)

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>

export function toConvexExpensePayload(value: ExpenseFormValues) {
	const isOneTime = value.type === 'one_time'
	return {
		name: value.name.trim(),
		amount: Number(value.amount),
		type: value.type,
		period: isOneTime ? undefined : value.period,
		startDate: isOneTime ? undefined : value.startDate,
		endDate: isOneTime ? undefined : value.endDate || undefined,
		targetDate: isOneTime ? value.targetDate : undefined,
		tagId: value.tagId ? (value.tagId as Id<'tags'>) : undefined,
	}
}

function getDefaultDate() {
	return new Date().toISOString().slice(0, 10)
}

export const defaultExpenseValues: ExpenseFormValues = {
	name: '',
	amount: '',
	type: 'recurring',
	period: 'monthly',
	startDate: getDefaultDate(),
	endDate: '',
	targetDate: getDefaultDate(),
	tagId: null,
}

export function expenseToFormValues(expense: Doc<'expenses'>): ExpenseFormValues {
	return {
		name: expense.name,
		amount: String(expense.amount),
		type: expense.type,
		period: expense.period ?? 'monthly',
		startDate: expense.startDate ?? getDefaultDate(),
		endDate: expense.endDate ?? '',
		targetDate: expense.targetDate ?? getDefaultDate(),
		tagId: expense.tagId ?? null,
	}
}

export const ExpenseFields = withForm({
	defaultValues: defaultExpenseValues,
	render: ({ form }) => (
		<div className="flex flex-col gap-4">
			<form.AppField name="name">{(field) => <field.TextField label="Nom" />}</form.AppField>

			<form.AppField name="amount">
				{(field) => <field.TextField label="Montant (€)" type="number" />}
			</form.AppField>

			<form.Subscribe selector={(state) => state.values.type}>
				{(type) => {
					const isOneTime = type === 'one_time'
					return (
						<>
							<div className="flex gap-2">
								<div className="flex-1">
									<form.AppField name="type">
										{(field) => <field.SelectField label="Type" options={typeOptions} />}
									</form.AppField>
								</div>
								{!isOneTime && (
									<div className="flex-1">
										<form.AppField name="period">
											{(field) => <field.SelectField label="Période" options={periodOptions} />}
										</form.AppField>
									</div>
								)}
							</div>

							{isOneTime ? (
								<form.AppField name="targetDate">
									{(field) => <field.TextField label="Date" type="date" />}
								</form.AppField>
							) : (
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
							)}
						</>
					)
				}}
			</form.Subscribe>

			<form.Subscribe selector={(state) => state.values.tagId}>
				{(tagId) => <TagSelector onChange={(v) => form.setFieldValue('tagId', v)} value={tagId} />}
			</form.Subscribe>
		</div>
	),
})
