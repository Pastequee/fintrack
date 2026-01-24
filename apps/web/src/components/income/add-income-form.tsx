import { api } from '@repo/convex/_generated/api'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import { useAppForm } from '~/lib/hooks/form-hook'
import { LoggedIn } from '../auth/logged-in'
import {
	defaultIncomeValues,
	IncomeFields,
	incomeFormSchema,
	toConvexIncomePayload,
} from './income-fields'

export const AddIncomeForm = () => {
	const createMutation = useMutation(api.incomes.create)
	const [isPending, setIsPending] = useState(false)

	const form = useAppForm({
		defaultValues: defaultIncomeValues,
		validators: {
			onChange: incomeFormSchema,
			onMount: incomeFormSchema,
			onSubmit: incomeFormSchema,
		},
		onSubmit: async ({ value }) => {
			setIsPending(true)
			try {
				await createMutation(toConvexIncomePayload(value))
				form.reset()
			} finally {
				setIsPending(false)
			}
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
				<IncomeFields form={form} />

				<form.AppForm>
					<form.SubmitButton disabled={isPending} label="Ajouter un revenu" />
				</form.AppForm>
			</form>
		</LoggedIn>
	)
}
