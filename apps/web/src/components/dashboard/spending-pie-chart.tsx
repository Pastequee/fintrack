import { useQuery } from '@tanstack/react-query'
import { PieChart as PieChartIcon } from 'lucide-react'
import { Cell, Pie, PieChart, Tooltip } from 'recharts'
import { expensesByTagOptions } from '~/lib/queries/stats.queries'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { ChartContainer } from '../ui/chart'
import {
	type ChartDataItem,
	ChartEmptyState,
	ChartLegendCustom,
	ChartLoadingState,
	ChartTooltip,
} from './chart-shared'

const UNTAGGED_COLOR = '#64748b'
const UNTAGGED_LABEL = 'Sans tag'

type SpendingPieChartProps = {
	year: number
	month: number
}

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
				<Tooltip content={<ChartTooltip />} />
			</PieChart>
		</ChartContainer>
		<ChartLegendCustom data={data} />
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
		if (isLoading) return <ChartLoadingState />
		if (hasData) return <ChartContent data={chartData} />
		return <ChartEmptyState icon={PieChartIcon} message="Aucune dépense ce mois" />
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
