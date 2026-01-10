import type { SplitMode } from '@repo/db/types'
import { useMutation } from '@tanstack/react-query'
import { updateHouseholdOptions } from '~/lib/mutations/households.mutations'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

type SplitModeToggleProps = {
	householdId: string
	currentMode: SplitMode
}

const splitModeConfig: Record<SplitMode, { label: string; description: string }> = {
	equal: { label: 'Equal Split', description: 'Expenses split equally among members' },
	income_proportional: {
		label: 'Income Proportional',
		description: 'Expenses split based on income ratio',
	},
}

export const SplitModeToggle = ({ householdId, currentMode }: SplitModeToggleProps) => {
	const { mutate, isPending } = useMutation(updateHouseholdOptions(householdId))

	return (
		<div className="flex flex-col gap-2">
			<Label>Split Mode</Label>
			<Select
				disabled={isPending}
				onValueChange={(value) => mutate({ splitMode: value as SplitMode })}
				value={currentMode}
			>
				<SelectTrigger>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="equal">{splitModeConfig.equal.label}</SelectItem>
					<SelectItem value="income_proportional">
						{splitModeConfig.income_proportional.label}
					</SelectItem>
				</SelectContent>
			</Select>
			<p className="text-muted-foreground text-xs">{splitModeConfig[currentMode].description}</p>
		</div>
	)
}
