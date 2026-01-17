import { CalendarDays, Clock, Repeat } from 'lucide-react'
import { cn } from '~/lib/utils/cn'
import { formatCurrency } from '~/lib/utils/format-currency'

type BalanceItemProps = {
	name: string
	amount: number
	type?: 'one_time' | 'recurring'
	endDate?: string | null
}

const typeIcons = {
	one_time: CalendarDays,
	recurring: Repeat,
} as const

// Check if expense ends within 2 months from now
function isEndingSoon(endDate: string | null): boolean {
	if (!endDate) return false
	const end = new Date(endDate)
	const now = new Date()
	const twoMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 2, now.getDate())
	return end <= twoMonthsFromNow && end >= now
}

export const BalanceItem = ({ name, amount, type, endDate }: BalanceItemProps) => {
	const Icon = type ? typeIcons[type] : null
	const endingSoon = isEndingSoon(endDate ?? null)

	return (
		<div className="flex items-center justify-between text-muted-foreground text-xs">
			<span className="flex items-center gap-1.5 truncate">
				{Icon && <Icon className="shrink-0" size={12} />}
				{name}
				{endingSoon && (
					<span className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1 py-0.5 text-[10px] text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
						<Clock size={10} />
						fin proche
					</span>
				)}
			</span>
			<span className={cn(endingSoon && 'text-amber-600 dark:text-amber-400')}>
				{formatCurrency(amount)}
			</span>
		</div>
	)
}
