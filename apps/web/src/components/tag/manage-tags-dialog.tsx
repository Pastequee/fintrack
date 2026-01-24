import { api } from '@repo/convex/_generated/api'
import type { Doc } from '@repo/convex/_generated/dataModel'
import { useMutation, useQuery } from 'convex/react'
import { PencilIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { useState } from 'react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '../ui/alert-dialog'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { AddTagDialog } from './add-tag-dialog'
import { ColorPicker } from './color-picker'
import { TagBadge } from './tag-badge'

type ManageTagsDialogProps = {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function ManageTagsDialog({ open, onOpenChange }: ManageTagsDialogProps) {
	const tags = useQuery(api.tags.list) ?? []
	const [addOpen, setAddOpen] = useState(false)
	const [editingTag, setEditingTag] = useState<Doc<'tags'> | null>(null)
	const [deletingTag, setDeletingTag] = useState<Doc<'tags'> | null>(null)

	return (
		<>
			<Dialog onOpenChange={onOpenChange} open={open}>
				<DialogContent className="max-h-[80vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Manage Tags</DialogTitle>
					</DialogHeader>

					<div className="flex flex-col gap-2">
						{tags.length === 0 ? (
							<p className="py-4 text-center text-muted-foreground text-sm">
								No tags yet. Create one to categorize expenses.
							</p>
						) : (
							tags.map((tag) => (
								<div
									className="flex items-center gap-3 rounded-md border border-border px-3 py-2"
									key={tag._id}
								>
									<TagBadge color={tag.color} name={tag.name} size="md" />
									<span className="flex-1" />
									<Button onClick={() => setEditingTag(tag)} size="icon-xs" variant="ghost">
										<PencilIcon className="size-3.5" />
									</Button>
									<Button onClick={() => setDeletingTag(tag)} size="icon-xs" variant="ghost">
										<TrashIcon className="size-3.5" />
									</Button>
								</div>
							))
						)}
					</div>

					<DialogFooter>
						<Button onClick={() => setAddOpen(true)} variant="outline">
							<PlusIcon className="size-4" />
							Add Tag
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AddTagDialog onOpenChange={setAddOpen} open={addOpen} />

			{editingTag && (
				<EditTagDialog onOpenChange={() => setEditingTag(null)} open tag={editingTag} />
			)}

			{deletingTag && (
				<DeleteTagDialog onOpenChange={() => setDeletingTag(null)} open tag={deletingTag} />
			)}
		</>
	)
}

type EditTagDialogProps = {
	tag: Doc<'tags'>
	open: boolean
	onOpenChange: (open: boolean) => void
}

function EditTagDialog({ tag, open, onOpenChange }: EditTagDialogProps) {
	const [name, setName] = useState(tag.name)
	const [color, setColor] = useState(tag.color)
	const [isPending, setIsPending] = useState(false)

	const updateMutation = useMutation(api.tags.update)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		const trimmedName = name.trim()
		if (!trimmedName) return

		setIsPending(true)
		try {
			await updateMutation({ id: tag._id, name: trimmedName, color })
			onOpenChange(false)
		} finally {
			setIsPending(false)
		}
	}

	const isValid = name.trim().length > 0

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Tag</DialogTitle>
				</DialogHeader>

				<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
					<div className="flex flex-col gap-2">
						<Label htmlFor="edit-tag-name">Name</Label>
						<Input
							autoFocus
							id="edit-tag-name"
							onChange={(e) => setName(e.target.value)}
							value={name}
						/>
					</div>

					<div className="flex flex-col gap-2">
						<Label>Color</Label>
						<ColorPicker onChange={setColor} value={color} />
					</div>

					<DialogFooter>
						<Button disabled={isPending || !isValid} type="submit">
							Save
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}

type DeleteTagDialogProps = {
	tag: Doc<'tags'>
	open: boolean
	onOpenChange: (open: boolean) => void
}

function DeleteTagDialog({ tag, open, onOpenChange }: DeleteTagDialogProps) {
	const [isPending, setIsPending] = useState(false)
	const deleteMutation = useMutation(api.tags.remove)

	const handleDelete = async () => {
		setIsPending(true)
		try {
			await deleteMutation({ id: tag._id })
			onOpenChange(false)
		} finally {
			setIsPending(false)
		}
	}

	return (
		<AlertDialog onOpenChange={onOpenChange} open={open}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete Tag</AlertDialogTitle>
					<AlertDialogDescription>
						Delete "{tag.name}"? Expenses with this tag will become untagged.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction disabled={isPending} onClick={handleDelete}>
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
