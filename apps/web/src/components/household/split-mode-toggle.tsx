import { api } from '@repo/convex/_generated/api'
import type { Id } from '@repo/convex/_generated/dataModel'
import { typedObjectEntries } from '@repo/utils'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

type SplitMode = 'equal' | 'income_proportional'

type SplitModeToggleProps = {
	householdId: Id<'households'>
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
	const updateMutation = useMutation(api.households.update)
	const [isPending, setIsPending] = useState(false)

	const handleChange = async (value: string | null) => {
		if (!value) return
		setIsPending(true)
		try {
			await updateMutation({ id: householdId, splitMode: value as SplitMode })
		} finally {
			setIsPending(false)
		}
	}

	return (
		<div className="flex flex-col gap-2">
			<Label>Mode de partage</Label>
			<Select disabled={isPending} onValueChange={handleChange} value={currentMode}>
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
