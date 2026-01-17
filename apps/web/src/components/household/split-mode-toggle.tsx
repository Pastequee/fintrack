import type { SplitMode } from '@repo/db/types'
import { typedObjectEntries } from '@repo/utils'
import { useMutation } from '@tanstack/react-query'
import { updateHouseholdOptions } from '~/lib/mutations/households.mutations'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

type SplitModeToggleProps = {
	householdId: string
	currentMode: SplitMode
}

const splitModeConfig: Record<SplitMode, { label: string; description: string }> = {
	equal: {
		label: 'Partage égal',
		description: 'Dépenses réparties équitablement entre les membres',
	},
	income_proportional: {
		label: 'Proportionnel aux revenus',
		description: 'Dépenses réparties selon les revenus',
	},
}

const splitModeOptions = typedObjectEntries(splitModeConfig).map(([value, { label }]) => ({
	value,
	label,
}))

export const SplitModeToggle = ({ householdId, currentMode }: SplitModeToggleProps) => {
	const { mutate, isPending } = useMutation(updateHouseholdOptions(householdId))

	return (
		<div className="flex flex-col gap-2">
			<Label>Mode de partage</Label>
			<Select
				disabled={isPending}
				items={splitModeOptions}
				onValueChange={(value) => mutate({ splitMode: value as SplitMode })}
				value={currentMode}
			>
				<SelectTrigger>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{splitModeOptions.map(({ value, label }) => (
						<SelectItem key={value} value={value}>
							{label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<p className="text-muted-foreground text-xs">{splitModeConfig[currentMode].description}</p>
		</div>
	)
}
