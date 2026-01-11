import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import { type accounts, roles, type sessions, type users, type verifications } from './schemas/auth'
import { expensePeriod, expenses, expenseType } from './schemas/expenses'
import {
	householdMembers,
	households,
	invitationStatus,
	invitations,
	splitMode,
} from './schemas/households'
import { incomePeriod, incomes } from './schemas/incomes'
import { pockets } from './schemas/pockets'
import { snapshots } from './schemas/snapshots'
import { todoStatus, todos } from './schemas/todos'

const omits = { id: true, createdAt: true, updatedAt: true } as const

// todos.ts
export const TodoStatus = [...todoStatus.enumValues] as const
export type TodoStatus = (typeof TodoStatus)[number]

export type Todo = typeof todos.$inferSelect
export type TodoInsert = typeof todos.$inferInsert
export type TodoUpdate = Partial<TodoInsert>
export const todoSchema = createSelectSchema(todos)
export const todoInsertSchema = createInsertSchema(todos).omit({ ...omits, userId: true })
export const todoUpdateSchema = createUpdateSchema(todos).omit({ ...omits, userId: true })

// incomes.ts
export const IncomePeriod = [...incomePeriod.enumValues] as const
export type IncomePeriod = (typeof IncomePeriod)[number]

export type Income = typeof incomes.$inferSelect
export type IncomeInsert = typeof incomes.$inferInsert
export type IncomeUpdate = Partial<IncomeInsert>
export const incomeSchema = createSelectSchema(incomes)
export const incomeInsertSchema = createInsertSchema(incomes).omit({ ...omits, userId: true })
export const incomeUpdateSchema = createUpdateSchema(incomes).omit({ ...omits, userId: true })

// expenses.ts
export const ExpenseType = [...expenseType.enumValues] as const
export type ExpenseType = (typeof ExpenseType)[number]

export const ExpensePeriod = [...expensePeriod.enumValues] as const
export type ExpensePeriod = (typeof ExpensePeriod)[number]

export type Expense = typeof expenses.$inferSelect
export type ExpenseInsert = typeof expenses.$inferInsert
export type ExpenseUpdate = Partial<ExpenseInsert>
export const expenseSchema = createSelectSchema(expenses)
export const expenseInsertSchema = createInsertSchema(expenses).omit({
	...omits,
	userId: true,
	householdId: true,
})
export const expenseUpdateSchema = createUpdateSchema(expenses).omit({
	...omits,
	userId: true,
	householdId: true,
})

// pockets.ts
export type Pocket = typeof pockets.$inferSelect
export type PocketInsert = typeof pockets.$inferInsert
export type PocketUpdate = Partial<PocketInsert>
export const pocketSchema = createSelectSchema(pockets)
export const pocketInsertSchema = createInsertSchema(pockets).omit({ ...omits, userId: true })
export const pocketUpdateSchema = createUpdateSchema(pockets).omit({ ...omits, userId: true })

// households.ts
export const SplitMode = [...splitMode.enumValues] as const
export type SplitMode = (typeof SplitMode)[number]

export type Household = typeof households.$inferSelect
export type HouseholdInsert = typeof households.$inferInsert
export type HouseholdUpdate = Partial<HouseholdInsert>
export const householdSchema = createSelectSchema(households)
export const householdInsertSchema = createInsertSchema(households).omit(omits)
export const householdUpdateSchema = createUpdateSchema(households).omit(omits)

export type HouseholdMember = typeof householdMembers.$inferSelect
export type HouseholdMemberInsert = typeof householdMembers.$inferInsert
export const householdMemberSchema = createSelectSchema(householdMembers)

// invitations
export const InvitationStatus = [...invitationStatus.enumValues] as const
export type InvitationStatus = (typeof InvitationStatus)[number]

export type Invitation = typeof invitations.$inferSelect
export type InvitationInsert = typeof invitations.$inferInsert
export const invitationSchema = createSelectSchema(invitations)
export const invitationInsertSchema = createInsertSchema(invitations).omit({
	...omits,
	householdId: true,
	invitedBy: true,
	token: true,
	status: true,
	expiresAt: true,
})

// auth.ts
export const UserRole = [...roles.enumValues] as const
export type UserRole = (typeof UserRole)[number]

export type User = typeof users.$inferSelect
export type UserInsert = typeof users.$inferInsert

export type Session = typeof sessions.$inferSelect
export type SessionInsert = typeof sessions.$inferInsert

export type Account = typeof accounts.$inferSelect
export type AccountInsert = typeof accounts.$inferInsert

export type Verification = typeof verifications.$inferSelect
export type VerificationInsert = typeof verifications.$inferInsert

// snapshots.ts
export type { MonthlyBalance, SnapshotData } from './schemas/snapshots'
export type Snapshot = typeof snapshots.$inferSelect
export type SnapshotInsert = typeof snapshots.$inferInsert
export const snapshotSchema = createSelectSchema(snapshots)
