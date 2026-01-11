import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Archive, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { balanceOptions, snapshotOptions } from '~/lib/queries/balance.queries'
import { formatCurrency } from '~/lib/utils/format-currency'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Loader } from '../ui/loader'
import { BalanceItem } from './balance-item'
import { BalanceRow } from './balance-row'

const getMonthName = (month: number) => {
	const date = new Date(2000, month - 1, 1)
	return date.toLocaleDateString('en-US', { month: 'long' })
}

const isPastMonth = (year: number, month: number) => {
	const now = new Date()
	const currentYear = now.getFullYear()
	const currentMonth = now.getMonth() + 1
	return year < currentYear || (year === currentYear && month < currentMonth)
}

const isFutureMonth = (year: number, month: number) => {
	const now = new Date()
	const currentYear = now.getFullYear()
	const currentMonth = now.getMonth() + 1
	return year > currentYear || (year === currentYear && month > currentMonth)
}

type ViewModeBadgeProps = {
	viewingPast: boolean
	viewingFuture: boolean
}

const ViewModeBadge = ({ viewingPast, viewingFuture }: ViewModeBadgeProps) => {
	if (viewingPast) {
		return (
			<Badge className="gap-1" variant="secondary">
				<Archive size={12} />
				Archived
			</Badge>
		)
	}
	if (viewingFuture) {
		return (
			<Badge className="gap-1" variant="outline">
				<TrendingUp size={12} />
				Projection
			</Badge>
		)
	}
	return null
}

export const DashboardOverview = () => {
	const now = new Date()
	const [year, setYear] = useState(now.getFullYear())
	const [month, setMonth] = useState(now.getMonth() + 1)

	const viewingPast = isPastMonth(year, month)
	const viewingFuture = isFutureMonth(year, month)

	// Use snapshot for past months, live balance for current/future
	const {
		data: balance,
		isLoading: balanceLoading,
		isError: balanceError,
	} = useQuery({ ...balanceOptions(year, month), enabled: !viewingPast })

	const {
		data: snapshot,
		isLoading: snapshotLoading,
		isError: snapshotError,
	} = useQuery({ ...snapshotOptions(year, month), enabled: viewingPast })

	const isLoading = viewingPast ? snapshotLoading : balanceLoading
	const isError = viewingPast ? snapshotError : balanceError

	const data = viewingPast ? snapshot?.data : balance

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

	if (isError) {
		return (
			<Card className="w-full max-w-md">
				<CardContent>
					<p className="text-muted-foreground text-sm">Failed to load balance data</p>
				</CardContent>
			</Card>
		)
	}

	// No snapshot for past month - show message
	if (viewingPast && !data) {
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
				<CardContent>
					<p className="text-center text-muted-foreground text-sm">
						No archived data for this month
					</p>
				</CardContent>
			</Card>
		)
	}

	if (!data) return null

	const isDeficit = data.remaining < 0

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<div className="flex items-center justify-between">
					<Button onClick={goToPreviousMonth} size="icon" variant="ghost">
						<ChevronLeft size={20} />
					</Button>
					<div className="flex flex-col items-center gap-1">
						<CardTitle className="text-center">
							{getMonthName(month)} {year}
						</CardTitle>
						<ViewModeBadge viewingFuture={viewingFuture} viewingPast={viewingPast} />
					</div>
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
							Deficit of {formatCurrency(Math.abs(data.remaining))} this month
						</AlertDescription>
					</Alert>
				)}

				<BalanceRow amount={data.income} label="Income" variant="positive" />

				<BalanceRow
					amount={data.personalExpenses.total}
					expandable={data.personalExpenses.items.length > 0}
					label="Personal Expenses"
				>
					{data.personalExpenses.items.map((item) => (
						<BalanceItem
							amount={item.amount}
							key={item.name}
							name={item.name}
							type={item.type as 'one_time' | 'recurring'}
						/>
					))}
				</BalanceRow>

				<BalanceRow
					amount={data.householdShare.total}
					expandable={data.householdShare.items.length > 0}
					label="Household Share"
				>
					{data.householdShare.items.map((item) => (
						<BalanceItem amount={item.yourShare} key={item.name} name={item.name} />
					))}
				</BalanceRow>

				<BalanceRow
					amount={data.pockets.total}
					expandable={data.pockets.items.length > 0}
					label="Pockets"
				>
					{data.pockets.items.map((item) => (
						<BalanceItem amount={item.amount} key={item.name} name={item.name} />
					))}
				</BalanceRow>

				<div className="mt-2 border-t pt-2">
					<BalanceRow
						amount={data.remaining}
						label="Remaining"
						variant={isDeficit ? 'negative' : 'positive'}
					/>
				</div>
			</CardContent>
		</Card>
	)
}
