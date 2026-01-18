import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { DEFAULT_TAG_COLOR } from '~/lib/constants/tag-colors'
import { createTagOptions } from '~/lib/mutations/tags.mutations'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { ColorPicker } from './color-picker'

type AddTagDialogProps = {
	open: boolean
	onOpenChange: (open: boolean) => void
	onCreated?: (tagId: string) => void
}

export function AddTagDialog({ open, onOpenChange, onCreated }: AddTagDialogProps) {
	const [name, setName] = useState('')
	const [color, setColor] = useState<string>(DEFAULT_TAG_COLOR)

	const { isPending, mutate } = useMutation(createTagOptions())

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		const trimmedName = name.trim()
		if (!trimmedName) return

		mutate(
			{ name: trimmedName, color },
			{
				onSuccess: (data) => {
					setName('')
					setColor(DEFAULT_TAG_COLOR)
					onOpenChange(false)
					if (data && 'id' in data) {
						onCreated?.(data.id)
					}
				},
			}
		)
	}

	const isValid = name.trim().length > 0

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Créer un tag</DialogTitle>
				</DialogHeader>

				<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
					<div className="flex flex-col gap-2">
						<Label htmlFor="tag-name">Nom</Label>
						<Input
							autoFocus
							id="tag-name"
							onChange={(e) => setName(e.target.value)}
							placeholder="e.g. Groceries"
							value={name}
						/>
					</div>

					<div className="flex flex-col gap-2">
						<Label>Color</Label>
						<ColorPicker onChange={setColor} value={color} />
					</div>

					<DialogFooter>
						<Button disabled={isPending || !isValid} type="submit">
							Create
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
