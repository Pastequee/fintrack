import { useMutation } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useAppForm } from '~/lib/hooks/form-hook'
import { createIncomeOptions } from '~/lib/mutations/incomes.mutations'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import {
	defaultIncomeValues,
	IncomeFields,
	incomeFormSchema,
	toIncomePayload,
} from './income-fields'

export const AddIncomeDialog = () => {
	const [open, setOpen] = useState(false)
	const { isPending, mutate } = useMutation(createIncomeOptions())

	const form = useAppForm({
		defaultValues: defaultIncomeValues,
		validators: {
			onChange: incomeFormSchema,
			onMount: incomeFormSchema,
			onSubmit: incomeFormSchema,
		},
		onSubmit: ({ value }) => {
			mutate(toIncomePayload(value), {
				onSuccess: () => {
					form.reset()
					setOpen(false)
				},
			})
		},
	})

	return (
		<Dialog onOpenChange={setOpen} open={open}>
			<DialogTrigger
				render={
					<Button size="sm" variant="outline">
						<Plus size={16} />
						Ajouter
					</Button>
				}
			/>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Ajouter un revenu</DialogTitle>
				</DialogHeader>

				<form
					className="flex flex-col gap-4"
					onSubmit={(e) => {
						e.preventDefault()
						form.handleSubmit()
					}}
				>
					<IncomeFields form={form} />

					<form.AppForm>
						<form.SubmitButton disabled={isPending} label="Ajouter" />
					</form.AppForm>
				</form>
			</DialogContent>
		</Dialog>
	)
}
