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

	invitations: defineTable({
		householdId: v.id('households'),
		invitedBy: v.id('users'),
		email: v.string(),
		token: v.string(),
		status: v.union(
			v.literal('pending'),
			v.literal('accepted'),
			v.literal('declined'),
			v.literal('expired')
		),
		expiresAt: v.number(),
	})
		.index('by_household', ['householdId'])
		.index('by_email', ['email'])
		.index('by_token', ['token'])
		.index('by_status', ['status']),

	expenses: defineTable({
		userId: v.id('users'),
		householdId: v.optional(v.id('households')),
		tagId: v.optional(v.id('tags')),
		name: v.string(),
		amount: v.number(), // stored as cents (1234 = $12.34)
		type: v.union(v.literal('one_time'), v.literal('recurring')),
		period: v.optional(
			v.union(v.literal('daily'), v.literal('weekly'), v.literal('monthly'), v.literal('yearly'))
		),
		startDate: v.optional(v.string()),
		endDate: v.optional(v.string()),
		targetDate: v.optional(v.string()),
		active: v.boolean(),
	})
		.index('by_user', ['userId'])
		.index('by_household', ['householdId'])
		.index('by_user_personal', ['userId', 'householdId']),

	incomes: defineTable({
		userId: v.id('users'),
		name: v.string(),
		amount: v.number(), // stored as cents (1234 = $12.34)
		period: v.union(
			v.literal('daily'),
			v.literal('weekly'),
			v.literal('monthly'),
			v.literal('yearly')
		),
		startDate: v.string(),
		endDate: v.optional(v.string()),
	}).index('by_user', ['userId']),

	tags: defineTable({
		userId: v.id('users'),
		name: v.string(),
		color: v.string(),
	}).index('by_user', ['userId']),

	snapshots: defineTable({
		userId: v.id('users'),
		year: v.number(),
		month: v.number(), // 1-12
		data: v.object({
			income: v.number(), // stored as cents
			personalExpenses: v.object({
				total: v.number(), // stored as cents
				items: v.array(
					v.object({
						id: v.id('expenses'),
						name: v.string(),
						amount: v.number(), // stored as cents
					})
				),
			}),
			householdShare: v.object({
				total: v.number(), // stored as cents
				items: v.array(
					v.object({
						id: v.id('expenses'),
						name: v.string(),
						amount: v.number(), // stored as cents
						yourShare: v.number(), // stored as cents
					})
				),
			}),
			remaining: v.number(), // stored as cents (can be negative)
		}),
	}).index('by_user_month', ['userId', 'year', 'month']),
})
