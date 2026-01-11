import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { balanceOptions } from '~/lib/queries/balance.queries'
import { formatCurrency } from '~/lib/utils/format-currency'
import { Alert, AlertDescription } from '../ui/alert'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Loader } from '../ui/loader'
import { BalanceItem } from './balance-item'
import { BalanceRow } from './balance-row'

const getMonthName = (month: number) => {
	const date = new Date(2000, month - 1, 1)
	return date.toLocaleDateString('en-US', { month: 'long' })
}

export const DashboardOverview = () => {
	const now = new Date()
	const [year, setYear] = useState(now.getFullYear())
	const [month, setMonth] = useState(now.getMonth() + 1)

	const { data: balance, isLoading, isError } = useQuery(balanceOptions(year, month))

	const goToPreviousMonth = () => {
		if (month === 1) {
			setYear((y) => y - 1)
			setMonth(12)
		} else {
			setMonth((m) => m - 1)
		}
	}

	const goToNextMonth = () => {
		if (month === 12) {
			setYear((y) => y + 1)
			setMonth(1)
		} else {
			setMonth((m) => m + 1)
		}
	}

	if (isLoading) {
		return (
			<Card className="w-full max-w-md">
				<CardContent className="flex items-center justify-center py-12">
					<Loader />
				</CardContent>
			</Card>
		)
	}

	if (isError || !balance) {
		return (
			<Card className="w-full max-w-md">
				<CardContent>
					<p className="text-muted-foreground text-sm">Failed to load balance data</p>
				</CardContent>
			</Card>
		)
	}

	const isDeficit = balance.remaining < 0

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<div className="flex items-center justify-between">
					<Button onClick={goToPreviousMonth} size="icon" variant="ghost">
						<ChevronLeft size={20} />
					</Button>
					<CardTitle className="text-center">
						{getMonthName(month)} {year}
					</CardTitle>
					<Button onClick={goToNextMonth} size="icon" variant="ghost">
						<ChevronRight size={20} />
					</Button>
				</div>
			</CardHeader>

			<CardContent className="flex flex-col gap-1">
				{isDeficit && (
					<Alert className="mb-4" variant="destructive">
						<AlertTriangle size={16} />
						<AlertDescription>
							Deficit of {formatCurrency(Math.abs(balance.remaining))} this month
						</AlertDescription>
					</Alert>
				)}

				<BalanceRow amount={balance.income} label="Income" variant="positive" />

				<BalanceRow
					amount={balance.personalExpenses.total}
					expandable={balance.personalExpenses.items.length > 0}
					label="Personal Expenses"
				>
					{balance.personalExpenses.items.map((item) => (
						<BalanceItem amount={item.amount} key={item.name} name={item.name} />
					))}
				</BalanceRow>

				<BalanceRow
					amount={balance.householdShare.total}
					expandable={balance.householdShare.items.length > 0}
					label="Household Share"
				>
					{balance.householdShare.items.map((item) => (
						<BalanceItem amount={item.yourShare} key={item.name} name={item.name} />
					))}
				</BalanceRow>

				<BalanceRow
					amount={balance.pockets.total}
					expandable={balance.pockets.items.length > 0}
					label="Pockets"
				>
					{balance.pockets.items.map((item) => (
						<BalanceItem amount={item.amount} key={item.name} name={item.name} />
					))}
				</BalanceRow>

				<div className="mt-2 border-t pt-2">
					<BalanceRow
						amount={balance.remaining}
						label="Remaining"
						variant={isDeficit ? 'negative' : 'positive'}
					/>
				</div>
			</CardContent>
		</Card>
	)
}
