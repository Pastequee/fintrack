import { IncomePeriod } from '@repo/db/types'
import { useMutation } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '~/lib/hooks/use-auth'
import { createIncomeOptions } from '~/lib/mutations/incomes.mutations'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Loader } from '../ui/loader'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

const periodOptions = IncomePeriod.map((p) => ({
	value: p,
	label: p.charAt(0).toUpperCase() + p.slice(1),
}))

export const AddIncomeForm = () => {
	const [name, setName] = useState('')
	const [amount, setAmount] = useState('')
	const [period, setPeriod] = useState<(typeof IncomePeriod)[number]>('monthly')
	const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0])

	const auth = useAuth()

	const { isPending, mutate } = useMutation(createIncomeOptions())

	const canSubmit = auth && name.trim() && amount && Number.parseFloat(amount) > 0 && startDate

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!canSubmit) return

		mutate(
			{ name: name.trim(), amount, period, startDate },
			{
				onSuccess: () => {
					setName('')
					setAmount('')
					setPeriod('monthly')
					setStartDate(new Date().toISOString().split('T')[0])
				},
			}
		)
	}

	return (
		<form className="flex flex-col gap-3" onSubmit={handleSubmit}>
			<div className="flex gap-2">
				<Input
					className="flex-1"
					disabled={!auth}
					onChange={(e) => setName(e.target.value)}
					placeholder="Income name"
					value={name}
				/>
				<Input
					className="w-28"
					disabled={!auth}
					onChange={(e) => setAmount(e.target.value)}
					placeholder="Amount"
					step="0.01"
					type="number"
					value={amount}
				/>
			</div>

			<div className="flex gap-2">
				<Select
					disabled={!auth}
					onValueChange={(v) => setPeriod(v as typeof period)}
					value={period}
				>
					<SelectTrigger className="flex-1">
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

				<Input
					className="flex-1"
					disabled={!auth}
					onChange={(e) => setStartDate(e.target.value)}
					type="date"
					value={startDate}
				/>

				<Button disabled={!canSubmit || isPending} type="submit">
					<Plus size={16} />
					Add
					{isPending && <Loader />}
				</Button>
			</div>
		</form>
	)
}
