import { useQuery } from '@tanstack/react-query'
import { TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { monthlyTrendOptions } from '~/lib/queries/stats.queries'
import { formatCurrency } from '~/lib/utils/format-currency'
import { formatMonth } from '~/lib/utils/format-date'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { ChartContainer } from '../ui/chart'

const BAR_COLOR = '#475569'

type ChartDataItem = {
	month: string
	total: number
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
			<p className="font-medium text-foreground text-sm capitalize">{data.month}</p>
			<p className="mt-1 font-semibold text-foreground tabular-nums">
				{formatCurrency(data.total)}
			</p>
		</div>
	)
}

const EmptyState = () => (
	<div className="flex flex-col items-center justify-center py-8">
		<div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
			<TrendingUp className="text-muted-foreground/60" size={20} />
		</div>
		<p className="mt-3 text-muted-foreground text-sm">Aucune donnée disponible</p>
	</div>
)

const LoadingState = () => (
	<div className="flex h-[200px] items-center justify-center">
		<div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-muted-foreground" />
	</div>
)

const ChartContent = ({ data }: { data: ChartDataItem[] }) => (
	<ChartContainer className="h-[220px] w-full" config={{}}>
		<BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
			<CartesianGrid strokeDasharray="3 3" vertical={false} />
			<XAxis
				axisLine={false}
				dataKey="month"
				tickFormatter={(value) => value.slice(0, 3)}
				tickLine={false}
				tickMargin={8}
			/>
			<YAxis
				axisLine={false}
				tickFormatter={(value) => `${value}€`}
				tickLine={false}
				tickMargin={4}
				width={50}
			/>
			<Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
			<Bar dataKey="total" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
		</BarChart>
	</ChartContainer>
)

export const SpendingTrendChart = () => {
	const { data: trendData, isLoading } = useQuery(monthlyTrendOptions(6))

	const chartData: ChartDataItem[] =
		trendData?.map((item) => ({
			month: formatMonth(new Date(item.year, item.month - 1, 1)),
			total: item.total,
		})) ?? []

	const hasData = chartData.length > 0 && chartData.some((d) => d.total > 0)

	const renderContent = () => {
		if (isLoading) return <LoadingState />
		if (hasData) return <ChartContent data={chartData} />
		return <EmptyState />
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Évolution des dépenses</CardTitle>
			</CardHeader>
			<CardContent>{renderContent()}</CardContent>
		</Card>
	)
}
