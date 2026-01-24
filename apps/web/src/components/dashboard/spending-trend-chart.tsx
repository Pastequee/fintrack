import { api } from '@repo/convex/_generated/api'
import { useQuery } from 'convex/react'
import { TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCurrency } from '~/lib/utils/format-currency'
import { formatMonth } from '~/lib/utils/format-date'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { ChartContainer } from '../ui/chart'
import { ChartEmptyState, ChartLoadingState } from './chart-shared'

const BAR_COLOR = '#475569'

type ChartDataItem = {
	month: string
	total: number
}

const TrendTooltip = ({
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
			<Tooltip content={<TrendTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
			<Bar dataKey="total" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
		</BarChart>
	</ChartContainer>
)

export const SpendingTrendChart = () => {
	const trendData = useQuery(api.stats.monthlyTrend, { monthsBack: 6 })
	const isLoading = trendData === undefined

	const chartData: ChartDataItem[] =
		trendData?.map((item) => ({
			month: formatMonth(new Date(item.year, item.month - 1, 1)),
			total: item.total,
		})) ?? []

	const hasData = chartData.length > 0 && chartData.some((d) => d.total > 0)

	const renderContent = () => {
		if (isLoading) return <ChartLoadingState />
		if (hasData) return <ChartContent data={chartData} />
		return <ChartEmptyState icon={TrendingUp} message="Aucune donnée disponible" />
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
