import { TAG_COLORS } from '~/lib/constants/tag-colors'

type ColorPickerProps = {
	value: string
	onChange: (color: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
	return (
		<div className="flex flex-wrap gap-2">
			{TAG_COLORS.map((c) => (
				<button
					aria-label={c.label}
					className="size-8 rounded-full transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					key={c.value}
					onClick={() => onChange(c.value)}
					style={{
						backgroundColor: c.value,
						boxShadow: value === c.value ? `0 0 0 2px white, 0 0 0 4px ${c.value}` : undefined,
					}}
					type="button"
				/>
			))}
		</div>
	)
}
