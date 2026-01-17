import { useFieldContext } from '~/lib/hooks/form-hook'
import { Label } from '../label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select'

type SelectOption = { value: string; label: string }

type SelectFieldProps = {
	label: string
	options: SelectOption[]
	placeholder?: string
	disabled?: boolean
}

export function SelectField({ label, options, placeholder, disabled }: SelectFieldProps) {
	const field = useFieldContext<string>()

	const errorMessage = field.state.meta.isDirty
		? (field.state.meta.errors as { message: string }[]).at(0)?.message
		: undefined

	return (
		<div className="flex flex-col gap-2">
			<Label htmlFor={field.name}>{label}</Label>
			<Select
				disabled={disabled}
				items={options}
				onValueChange={(v) => v && field.handleChange(v)}
				value={field.state.value}
			>
				<SelectTrigger>
					<SelectValue>{placeholder}</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{options.map((opt) => (
						<SelectItem key={opt.value} value={opt.value}>
							{opt.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{errorMessage && <em className="text-destructive text-xs opacity-70">{errorMessage}</em>}
		</div>
	)
}
