import { useQuery } from '@tanstack/react-query'
import { PieChart as PieChartIcon } from 'lucide-react'
import { Cell, Pie, PieChart, Tooltip } from 'recharts'
import { expensesByTagOptions } from '~/lib/queries/stats.queries'
import { formatCurrency } from '~/lib/utils/format-currency'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { ChartContainer } from '../ui/chart'

const UNTAGGED_COLOR = '#64748b'
const UNTAGGED_LABEL = 'Sans tag'

type SpendingPieChartProps = {
	year: number
	month: number
}

type ChartDataItem = {
	name: string
	value: number
	color: string
}

const CustomTooltip = ({
	active,
	payload,
}: {
	active?: boolean
	payload?: Array<{ payload: ChartDataItem }>
}) => {
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

const ChartLegend = ({ data }: { data: ChartDataItem[] }) => (
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

const EmptyState = () => (
	<div className="flex flex-col items-center justify-center py-8">
		<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
			<PieChartIcon className="text-muted-foreground/60" size={20} />
		</div>
		<p className="mt-3 text-muted-foreground text-sm">Aucune dépense ce mois</p>
	</div>
)

const LoadingState = () => (
	<div className="flex h-[200px] items-center justify-center">
		<div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-muted-foreground" />
	</div>
)

const ChartContent = ({ data }: { data: ChartDataItem[] }) => (
	<>
		<ChartContainer className="mx-auto aspect-square max-h-[220px]" config={{}}>
			<PieChart>
				<Pie
					cx="50%"
					cy="50%"
					data={data}
					dataKey="value"
					innerRadius={50}
					nameKey="name"
					outerRadius={90}
					paddingAngle={2}
					strokeWidth={0}
				>
					{data.map((entry) => (
						<Cell
							className="transition-opacity hover:opacity-80 focus:outline-none"
							fill={entry.color}
							key={entry.name}
						/>
					))}
				</Pie>
				<Tooltip content={<CustomTooltip />} />
			</PieChart>
		</ChartContainer>
		<ChartLegend data={data} />
	</>
)

export const SpendingPieChart = ({ year, month }: SpendingPieChartProps) => {
	const { data: expensesByTag, isLoading } = useQuery(expensesByTagOptions(year, month))

	const chartData: ChartDataItem[] =
		expensesByTag?.map((item) => ({
			name: item.tagName ?? UNTAGGED_LABEL,
			value: item.total,
			color: item.tagColor ?? UNTAGGED_COLOR,
		})) ?? []

	const hasData = chartData.length > 0 && chartData.some((d) => d.value > 0)

	const renderContent = () => {
		if (isLoading) return <LoadingState />
		if (hasData) return <ChartContent data={chartData} />
		return <EmptyState />
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Dépenses par catégorie</CardTitle>
			</CardHeader>
			<CardContent>{renderContent()}</CardContent>
		</Card>
	)
}
