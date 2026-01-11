import { formatCurrency } from '~/lib/utils/format-currency'

type BalanceItemProps = {
	name: string
	amount: number
}

export const BalanceItem = ({ name, amount }: BalanceItemProps) => (
	<div className="flex items-center justify-between text-muted-foreground text-xs">
		<span className="truncate">{name}</span>
		<span>{formatCurrency(amount)}</span>
	</div>
)
