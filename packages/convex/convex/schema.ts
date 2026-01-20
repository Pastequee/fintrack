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
})
