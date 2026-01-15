import { useQuery } from '@tanstack/react-query'
import {
	AlertTriangle,
	Archive,
	BarChart3,
	ChevronLeft,
	ChevronRight,
	TrendingDown,
	TrendingUp,
	Wallet,
} from 'lucide-react'
import { useState } from 'react'
import { balanceOptions, snapshotOptions } from '~/lib/queries/balance.queries'
import { cn } from '~/lib/utils/cn'
import { formatCurrency } from '~/lib/utils/format-currency'
import { LoggedIn } from '../auth/logged-in'
import { AddExpenseForm } from '../expense/add-expense-form'
import { ExpenseList } from '../expense/expense-list'
import { AddIncomeForm } from '../income/add-income-form'
import { IncomeList } from '../income/income-list'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Loader } from '../ui/loader'
import { Separator } from '../ui/separator'
import { BalanceItem } from './balance-item'
import { BalanceRow } from './balance-row'

const getMonthName = (month: number) =>
	new Date(2000, month - 1, 1).toLocaleDateString('fr-FR', { month: 'long' })

const getMonthOffset = (year: number, month: number, now: Date) =>
	(year - now.getFullYear()) * 12 + (month - (now.getMonth() + 1))

type ViewModeBadgeProps = {
	viewingPast: boolean
	viewingFuture: boolean
}

const ViewModeBadge = ({ viewingPast, viewingFuture }: ViewModeBadgeProps) => {
	if (viewingPast) {
		return (
			<Badge className="gap-1" variant="secondary">
				<Archive size={12} />
				Archivé
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

type InsightVariant = 'income' | 'expense' | 'household' | 'remaining'

const VARIANT_STYLES: Record<InsightVariant, { base: string; icon: string; amount: string }> = {
	income: {
		base: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50',
		icon: 'text-emerald-600 dark:text-emerald-400',
		amount: 'text-emerald-700 dark:text-emerald-300',
	},
	expense: {
		base: 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700/50',
		icon: 'text-slate-600 dark:text-slate-400',
		amount: 'text-slate-700 dark:text-slate-300',
	},
	household: {
		base: 'bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800/50',
		icon: 'text-violet-600 dark:text-violet-400',
		amount: 'text-violet-700 dark:text-violet-300',
	},
	remaining: {
		base: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50',
		icon: 'text-amber-600 dark:text-amber-400',
		amount: 'text-amber-700 dark:text-amber-300',
	},
}

const NEGATIVE_STYLES = {
	base: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/50',
	icon: 'text-red-600 dark:text-red-400',
	amount: 'text-red-700 dark:text-red-300',
}

type InsightCardProps = {
	label: string
	amount: number
	icon: React.ReactNode
	variant: InsightVariant
	isNegative?: boolean
}

const InsightCard = ({ label, amount, icon, variant, isNegative }: InsightCardProps) => {
	const styles = variant === 'remaining' && isNegative ? NEGATIVE_STYLES : VARIANT_STYLES[variant]

	return (
		<div className={cn('flex flex-col gap-2 rounded-xl border p-4 transition-all', styles.base)}>
			<div className="flex items-center justify-between">
				<span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
					{label}
				</span>
				<span className={cn('opacity-70', styles.icon)}>{icon}</span>
			</div>
			<span className={cn('font-semibold text-xl tabular-nums', styles.amount)}>
				{formatCurrency(amount)}
			</span>
		</div>
	)
}

export const PersonalTab = () => {
	const now = new Date()
	const [year, setYear] = useState(now.getFullYear())
	const [month, setMonth] = useState(now.getMonth() + 1)

	const monthOffset = getMonthOffset(year, month, now)
	const viewingPast = monthOffset < 0
	const viewingFuture = monthOffset > 0

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

	const isDeficit = data ? data.remaining < 0 : false

	return (
		<div className="flex w-full max-w-5xl flex-col gap-6">
			{/* Month Navigation */}
			<div className="flex items-center justify-center gap-4">
				<Button onClick={goToPreviousMonth} size="icon" variant="ghost">
					<ChevronLeft size={20} />
				</Button>
				<div className="flex flex-col items-center gap-1">
					<h2 className="font-semibold text-lg capitalize">
						{getMonthName(month)} {year}
					</h2>
					<ViewModeBadge viewingFuture={viewingFuture} viewingPast={viewingPast} />
				</div>
				<Button onClick={goToNextMonth} size="icon" variant="ghost">
					<ChevronRight size={20} />
				</Button>
			</div>

			{/* Deficit Alert */}
			{isDeficit && (
				<Alert variant="destructive">
					<AlertTriangle size={16} />
					<AlertDescription>
						Déficit de {formatCurrency(Math.abs(data?.remaining ?? 0))} ce mois-ci
					</AlertDescription>
				</Alert>
			)}

			{/* Loading State */}
			{isLoading && (
				<Card>
					<CardContent className="flex items-center justify-center py-12">
						<Loader />
					</CardContent>
				</Card>
			)}

			{/* Error State */}
			{isError && (
				<Card>
					<CardContent className="py-8">
						<p className="text-center text-muted-foreground text-sm">
							Échec du chargement des données
						</p>
					</CardContent>
				</Card>
			)}

			{/* No Data for Past Month */}
			{viewingPast && !isLoading && !data && (
				<Card>
					<CardContent className="py-8">
						<p className="text-center text-muted-foreground text-sm">
							Aucune donnée archivée pour ce mois
						</p>
					</CardContent>
				</Card>
			)}

			{/* Main Content */}
			{data && (
				<>
					{/* Key Insight Cards */}
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
						<InsightCard
							amount={data.income}
							icon={<TrendingUp size={18} />}
							label="Revenus"
							variant="income"
						/>
						<InsightCard
							amount={data.personalExpenses.total}
							icon={<TrendingDown size={18} />}
							label="Dépenses"
							variant="expense"
						/>
						<InsightCard
							amount={data.householdShare.total}
							icon={<Wallet size={18} />}
							label="Part foyer"
							variant="household"
						/>
						<InsightCard
							amount={data.remaining}
							icon={<Wallet size={18} />}
							isNegative={isDeficit}
							label="Disponible"
							variant="remaining"
						/>
					</div>

					{/* Detailed Balance */}
					<Card>
						<CardContent className="flex flex-col gap-1">
							<h3 className="mb-2 font-medium text-muted-foreground text-sm">Détail du solde</h3>
							<BalanceRow amount={data.income} label="Revenus" variant="positive" />
							<BalanceRow
								amount={data.personalExpenses.total}
								expandable={data.personalExpenses.items.length > 0}
								label="Dépenses personnelles"
							>
								{data.personalExpenses.items.map((item) => (
									<BalanceItem
										amount={item.amount}
										endDate={item.endDate}
										key={item.name}
										name={item.name}
										type={item.type as 'one_time' | 'recurring'}
									/>
								))}
							</BalanceRow>
							<BalanceRow
								amount={data.householdShare.total}
								expandable={data.householdShare.items.length > 0}
								label="Part du foyer"
							>
								{data.householdShare.items.map((item) => (
									<BalanceItem amount={item.yourShare} key={item.name} name={item.name} />
								))}
							</BalanceRow>
							<div className="mt-2 border-t pt-2">
								<BalanceRow
									amount={data.remaining}
									label="Solde"
									variant={isDeficit ? 'negative' : 'positive'}
								/>
							</div>
						</CardContent>
					</Card>
				</>
			)}

			{/* Income and Expense Forms */}
			<div className="grid gap-6 md:grid-cols-2">
				{/* Revenus */}
				<Card>
					<CardContent className="flex flex-col gap-4">
						<h3 className="font-semibold text-base">Revenus</h3>
						<LoggedIn>
							<AddIncomeForm />
							<Separator />
							<IncomeList />
						</LoggedIn>
					</CardContent>
				</Card>

				{/* Dépenses */}
				<Card>
					<CardContent className="flex flex-col gap-4">
						<h3 className="font-semibold text-base">Dépenses</h3>
						<LoggedIn>
							<AddExpenseForm />
							<Separator />
							<ExpenseList />
						</LoggedIn>
					</CardContent>
				</Card>
			</div>

			{/* Charts Placeholder */}
			<Card>
				<CardContent className="flex flex-col items-center justify-center gap-3 py-12">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
						<BarChart3 className="text-muted-foreground" size={24} />
					</div>
					<p className="text-muted-foreground text-sm">Graphiques à venir</p>
				</CardContent>
			</Card>
		</div>
	)
}
