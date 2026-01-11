import { ChevronDown, ChevronUp } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { cn } from '~/lib/utils/cn'
import { formatCurrency } from '~/lib/utils/format-currency'

type BalanceRowProps = {
	label: string
	amount: number
	expandable?: boolean
	variant?: 'default' | 'positive' | 'negative'
	children?: ReactNode
}

export const BalanceRow = ({
	label,
	amount,
	expandable = false,
	variant = 'default',
	children,
}: BalanceRowProps) => {
	const [isExpanded, setIsExpanded] = useState(false)

	const getAmountColor = () => {
		switch (variant) {
			case 'positive':
				return 'text-green-600 dark:text-green-400'
			case 'negative':
				return 'text-red-600 dark:text-red-400'
			default:
				return ''
		}
	}

	return (
		<div className="flex flex-col">
			<button
				className={cn(
					'flex items-center justify-between py-2',
					expandable && '-mx-2 cursor-pointer rounded-md px-2 hover:bg-muted/50'
				)}
				disabled={!expandable}
				onClick={() => expandable && setIsExpanded(!isExpanded)}
				type="button"
			>
				<span className="flex items-center gap-2 text-sm">
					{label}
					{expandable && (isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
				</span>
				<span className={cn('font-medium', getAmountColor())}>{formatCurrency(amount)}</span>
			</button>

			{expandable && isExpanded && children && (
				<div className="flex flex-col gap-1 border-muted border-l-2 py-2 pl-4">{children}</div>
			)}
		</div>
	)
}
