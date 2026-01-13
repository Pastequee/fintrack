type TagBadgeProps = {
	color: string
	name: string
	size?: 'sm' | 'md'
}

export function TagBadge({ color, name, size = 'sm' }: TagBadgeProps) {
	const dotSize = size === 'sm' ? 'size-3' : 'size-4'

	return (
		<span className="flex items-center gap-2">
			<span className={`${dotSize} shrink-0 rounded-full`} style={{ backgroundColor: color }} />
			{name}
		</span>
	)
}
