import { api } from '@repo/convex/_generated/api'
import { useMutation } from 'convex/react'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useAppForm } from '~/lib/hooks/form-hook'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import {
	defaultIncomeValues,
	IncomeFields,
	incomeFormSchema,
	toConvexIncomePayload,
} from './income-fields'

export const AddIncomeDialog = () => {
	const [open, setOpen] = useState(false)
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
				setOpen(false)
			} finally {
				setIsPending(false)
			}
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
