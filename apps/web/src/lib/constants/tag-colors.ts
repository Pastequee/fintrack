export const TAG_COLORS = [
	{ value: '#ef4444', label: 'Red' },
	{ value: '#f97316', label: 'Orange' },
	{ value: '#eab308', label: 'Yellow' },
	{ value: '#22c55e', label: 'Green' },
	{ value: '#14b8a6', label: 'Teal' },
	{ value: '#0ea5e9', label: 'Sky' },
	{ value: '#3b82f6', label: 'Blue' },
	{ value: '#8b5cf6', label: 'Violet' },
	{ value: '#d946ef', label: 'Fuchsia' },
	{ value: '#ec4899', label: 'Pink' },
	{ value: '#78716c', label: 'Stone' },
	{ value: '#64748b', label: 'Slate' },
] as const

export type TagColor = (typeof TAG_COLORS)[number]['value']

export const DEFAULT_TAG_COLOR = TAG_COLORS[0].value
