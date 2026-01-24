import { api } from '@repo/convex/_generated/api'
import { useQuery } from 'convex/react'
import { PlusIcon, SettingsIcon } from 'lucide-react'
import { useState } from 'react'
import { Label } from '../ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from '../ui/select'
import { AddTagDialog } from './add-tag-dialog'
import { ManageTagsDialog } from './manage-tags-dialog'
import { TagBadge } from './tag-badge'

const NONE_VALUE = '__none__'
const CREATE_VALUE = '__create__'
const MANAGE_VALUE = '__manage__'

type TagSelectorProps = {
	value: string | null
	onChange: (value: string | null) => void
	label?: string
}

export function TagSelector({ value, onChange, label = 'Tag' }: TagSelectorProps) {
	const tags = useQuery(api.tags.list) ?? []
	const [addOpen, setAddOpen] = useState(false)
	const [manageOpen, setManageOpen] = useState(false)

	const selectedTag = tags.find((t) => t._id === value)

	const handleValueChange = (v: string | null) => {
		if (!v) return
		switch (v) {
			case CREATE_VALUE:
				setAddOpen(true)
				break
			case MANAGE_VALUE:
				setManageOpen(true)
				break
			case NONE_VALUE:
				onChange(null)
				break
			default:
				onChange(v)
		}
	}

	return (
		<>
			<div className="flex flex-col gap-2">
				<Label>{label}</Label>
				<Select onValueChange={handleValueChange} value={value ?? NONE_VALUE}>
					<SelectTrigger>
						<SelectValue>
							{selectedTag ? (
								<TagBadge color={selectedTag.color} name={selectedTag.name} />
							) : (
								<span className="text-muted-foreground">Pas de tag</span>
							)}
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={NONE_VALUE}>
							<span className="text-muted-foreground">Pas de tag</span>
						</SelectItem>

						{tags.map((tag) => (
							<SelectItem key={tag._id} value={tag._id}>
								<TagBadge color={tag.color} name={tag.name} />
							</SelectItem>
						))}

						<SelectSeparator />

						<SelectItem value={CREATE_VALUE}>
							<span className="flex items-center gap-2 text-muted-foreground">
								<PlusIcon className="size-3" />
								Créer un tag
							</span>
						</SelectItem>

						<SelectItem value={MANAGE_VALUE}>
							<span className="flex items-center gap-2 text-muted-foreground">
								<SettingsIcon className="size-3" />
								Gérer les tags
							</span>
						</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<AddTagDialog onCreated={onChange} onOpenChange={setAddOpen} open={addOpen} />
			<ManageTagsDialog onOpenChange={setManageOpen} open={manageOpen} />
		</>
	)
}
