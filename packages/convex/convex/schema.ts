import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
	users: defineTable({
		name: v.string(),
		email: v.string(),
		emailVerified: v.boolean(),
		image: v.optional(v.string()),
		role: v.union(v.literal('admin'), v.literal('user')),
		banned: v.boolean(),
		banReason: v.optional(v.string()),
		banExpires: v.optional(v.number()),
	}).index('by_email', ['email']),

	households: defineTable({
		name: v.string(),
		splitMode: v.union(v.literal('equal'), v.literal('income_proportional')),
	}),

	householdMembers: defineTable({
		householdId: v.id('households'),
		userId: v.id('users'),
		joinedAt: v.number(),
	})
		.index('by_household', ['householdId'])
		.index('by_user', ['userId'])
		.index('by_household_user', ['householdId', 'userId']),
})
