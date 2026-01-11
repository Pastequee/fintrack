import { CalendarDays, Repeat } from 'lucide-react'
import { formatCurrency } from '~/lib/utils/format-currency'

type BalanceItemProps = {
	name: string
	amount: number
	type?: 'one_time' | 'recurring'
}

const typeIcons = {
	one_time: CalendarDays,
	recurring: Repeat,
} as const

export const BalanceItem = ({ name, amount, type }: BalanceItemProps) => {
	const Icon = type ? typeIcons[type] : null

	return (
		<div className="flex items-center justify-between text-muted-foreground text-xs">
			<span className="flex items-center gap-1.5 truncate">
				{Icon && <Icon className="shrink-0" size={12} />}
				{name}
			</span>
			<span>{formatCurrency(amount)}</span>
		</div>
	)
}
