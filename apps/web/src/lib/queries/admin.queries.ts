import type { Id } from '@repo/convex/_generated/dataModel'

// Admin users are now fetched via Convex useQuery(api.users.list)
// This file is kept for type exports only

export type UserWithRole = {
	id: Id<'users'>
	name: string
	email: string
	image?: string
	role: 'admin' | 'user'
	banned: boolean
	banReason?: string
	banExpires?: number
}
