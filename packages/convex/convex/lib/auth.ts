import { getAuthUserId } from '@convex-dev/auth/server'
import { ConvexError } from 'convex/values'
import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'

export type Role = 'admin' | 'user'

/**
 * Get authenticated user ID or throw.
 * Use when route requires authentication.
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx): Promise<Id<'users'>> {
	const userId = await getAuthUserId(ctx)
	if (!userId) {
		throw new ConvexError({ code: 'UNAUTHORIZED', message: 'Authentication required' })
	}
	return userId
}

/**
 * Get authenticated user with role check.
 * Use when route requires specific role.
 */
export async function requireRole(
	ctx: QueryCtx | MutationCtx,
	role: Role
): Promise<{ userId: Id<'users'>; user: Doc<'users'> }> {
	const userId = await requireAuth(ctx)
	const user = await ctx.db.get(userId)

	if (!user) {
		throw new ConvexError({ code: 'UNAUTHORIZED', message: 'User not found' })
	}

	if (user.banned) {
		throw new ConvexError({ code: 'FORBIDDEN', message: 'User is banned' })
	}

	const userRole = user.role ?? 'user'
	if (role === 'admin' && userRole !== 'admin') {
		throw new ConvexError({ code: 'FORBIDDEN', message: 'Admin access required' })
	}

	return { userId, user }
}

/**
 * Get authenticated user (returns user doc).
 * Use when you need the full user object.
 */
export async function requireUser(
	ctx: QueryCtx | MutationCtx
): Promise<{ userId: Id<'users'>; user: Doc<'users'> }> {
	const userId = await requireAuth(ctx)
	const user = await ctx.db.get(userId)

	if (!user) {
		throw new ConvexError({ code: 'UNAUTHORIZED', message: 'User not found' })
	}

	if (user.banned) {
		throw new ConvexError({ code: 'FORBIDDEN', message: 'User is banned' })
	}

	return { userId, user }
}

/**
 * Check if user has admin role.
 */
export function isAdmin(user: Doc<'users'>): boolean {
	return user.role === 'admin'
}

/**
 * Get current user if authenticated (returns null if not).
 * Use for optional auth checks.
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
	const userId = await getAuthUserId(ctx)
	if (!userId) return null

	const user = await ctx.db.get(userId)
	if (!user || user.banned) return null

	return { userId, user }
}
