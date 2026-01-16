import type { LucideIcon } from 'lucide-react'
import { formatCurrency } from '~/lib/utils/format-currency'

export type ChartDataItem = {
	name: string
	value: number
	color: string
}

type TooltipPayload = {
	payload: ChartDataItem
}

type TooltipProps = {
	active?: boolean
	payload?: TooltipPayload[]
}

export const ChartTooltip = ({ active, payload }: TooltipProps) => {
	const item = payload?.[0]
	if (!active || !item) return null

	const data = item.payload
	return (
		<div className="rounded-lg border border-border/60 bg-background/95 px-3 py-2 shadow-lg backdrop-blur-sm">
			<div className="flex items-center gap-2">
				<span
					className="h-2.5 w-2.5 shrink-0 rounded-full"
					style={{ backgroundColor: data.color }}
				/>
				<span className="font-medium text-foreground text-sm">{data.name}</span>
			</div>
			<p className="mt-1 font-semibold text-foreground tabular-nums">
				{formatCurrency(data.value)}
			</p>
		</div>
	)
}

type LegendProps = {
	data: ChartDataItem[]
}

export const ChartLegendCustom = ({ data }: LegendProps) => (
	<div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
		{data.map((item) => (
			<div className="flex items-center gap-1.5" key={item.name}>
				<span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
				<span className="text-muted-foreground text-xs">{item.name}</span>
				<span className="font-medium text-foreground text-xs tabular-nums">
					{formatCurrency(item.value)}
				</span>
			</div>
		))}
	</div>
)

type EmptyStateProps = {
	icon: LucideIcon
	message: string
}

export const ChartEmptyState = ({ icon: Icon, message }: EmptyStateProps) => (
	<div className="flex flex-col items-center justify-center py-8">
		<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
			<Icon className="text-muted-foreground/60" size={20} />
		</div>
		<p className="mt-3 text-muted-foreground text-sm">{message}</p>
	</div>
)

export const ChartLoadingState = () => (
	<div className="flex h-[200px] items-center justify-center">
		<div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-muted-foreground" />
	</div>
)
