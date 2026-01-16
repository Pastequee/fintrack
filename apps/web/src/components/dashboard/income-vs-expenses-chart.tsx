import { BarChart3 } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { ChartContainer } from '../ui/chart'
import {
	type ChartDataItem,
	ChartEmptyState,
	ChartLegendCustom,
	ChartTooltip,
} from './chart-shared'

const COLORS = {
	income: '#10b981',
	personal: '#475569',
	household: '#8b5cf6',
}

type IncomeVsExpensesChartProps = {
	income: number
	personalExpenses: number
	householdShare: number
}

const ChartContent = ({ data }: { data: ChartDataItem[] }) => (
	<>
		<ChartContainer className="h-[220px] w-full" config={{}}>
			<BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
				<CartesianGrid strokeDasharray="3 3" vertical={false} />
				<XAxis axisLine={false} dataKey="name" tickLine={false} tickMargin={8} />
				<YAxis
					axisLine={false}
					tickFormatter={(value) => `${value}€`}
					tickLine={false}
					tickMargin={4}
					width={50}
				/>
				<Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
				<Bar dataKey="value" radius={[4, 4, 0, 0]}>
					{data.map((entry) => (
						<Cell fill={entry.color} key={entry.name} />
					))}
				</Bar>
			</BarChart>
		</ChartContainer>
		<ChartLegendCustom data={data} />
	</>
)

export const IncomeVsExpensesChart = ({
	income,
	personalExpenses,
	householdShare,
}: IncomeVsExpensesChartProps) => {
	const chartData: ChartDataItem[] = [
		{ name: 'Revenus', value: income, color: COLORS.income },
		{ name: 'Dépenses perso', value: personalExpenses, color: COLORS.personal },
		{ name: 'Part foyer', value: householdShare, color: COLORS.household },
	]

	const hasData = chartData.some((d) => d.value > 0)

	return (
		<Card>
			<CardHeader>
				<CardTitle>Revenus vs Dépenses</CardTitle>
			</CardHeader>
			<CardContent>
				{hasData ? (
					<ChartContent data={chartData} />
				) : (
					<ChartEmptyState icon={BarChart3} message="Aucune donnée disponible" />
				)}
			</CardContent>
		</Card>
	)
}
