import type { Income } from '@repo/db/types'
import { IncomePeriod } from '@repo/db/types'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { updateIncomeOptions } from '~/lib/mutations/incomes.mutations'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Loader } from '../ui/loader'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

type EditIncomeDialogProps = {
	income: Income
	open: boolean
	onOpenChange: (open: boolean) => void
}

const periodOptions = IncomePeriod.map((p) => ({
	value: p,
	label: p.charAt(0).toUpperCase() + p.slice(1),
}))

export const EditIncomeDialog = ({ income, open, onOpenChange }: EditIncomeDialogProps) => {
	const [name, setName] = useState(income.name)
	const [amount, setAmount] = useState(income.amount)
	const [period, setPeriod] = useState(income.period)
	const [startDate, setStartDate] = useState(income.startDate)
	const [endDate, setEndDate] = useState(income.endDate ?? '')

	useEffect(() => {
		if (open) {
			setName(income.name)
			setAmount(income.amount)
			setPeriod(income.period)
			setStartDate(income.startDate)
			setEndDate(income.endDate ?? '')
		}
	}, [open, income])

	const { isPending, mutate } = useMutation(updateIncomeOptions(income.id))

	const canSubmit = name.trim() && amount && Number.parseFloat(amount) > 0 && startDate

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!canSubmit) return

		mutate(
			{
				name: name.trim(),
				amount,
				period,
				startDate,
				endDate: endDate || null,
			},
			{
				onSuccess: () => onOpenChange(false),
			}
		)
	}

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Income</DialogTitle>
				</DialogHeader>

				<form className="flex flex-col gap-4" id="edit-income-form" onSubmit={handleSubmit}>
					<div className="flex flex-col gap-2">
						<Label htmlFor="income-name">Name</Label>
						<Input
							id="income-name"
							onChange={(e) => setName(e.target.value)}
							placeholder="Income name"
							value={name}
						/>
					</div>

					<div className="flex flex-col gap-2">
						<Label htmlFor="income-amount">Amount (€)</Label>
						<Input
							id="income-amount"
							onChange={(e) => setAmount(e.target.value)}
							placeholder="Amount"
							step="0.01"
							type="number"
							value={amount}
						/>
					</div>

					<div className="flex flex-col gap-2">
						<Label>Period</Label>
						<Select onValueChange={(v) => setPeriod(v as typeof period)} value={period}>
							<SelectTrigger>
								<SelectValue>Period</SelectValue>
							</SelectTrigger>
							<SelectContent>
								{periodOptions.map((opt) => (
									<SelectItem key={opt.value} value={opt.value}>
										{opt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex gap-2">
						<div className="flex flex-1 flex-col gap-2">
							<Label htmlFor="income-start">Start Date</Label>
							<Input
								id="income-start"
								onChange={(e) => setStartDate(e.target.value)}
								type="date"
								value={startDate}
							/>
						</div>

						<div className="flex flex-1 flex-col gap-2">
							<Label htmlFor="income-end">End Date (optional)</Label>
							<Input
								id="income-end"
								onChange={(e) => setEndDate(e.target.value)}
								type="date"
								value={endDate}
							/>
						</div>
					</div>
				</form>

				<DialogFooter>
					<Button onClick={() => onOpenChange(false)} type="button" variant="outline">
						Cancel
					</Button>
					<Button disabled={!canSubmit || isPending} form="edit-income-form" type="submit">
						Save
						{isPending && <Loader />}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
