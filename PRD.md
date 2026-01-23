# PRD: FinTrack Backend Migration to Convex

## Overview

Migrate from Elysia/PostgreSQL/Drizzle/better-auth to Convex backend-as-a-service.

**Current Stack:** Elysia + PostgreSQL + Drizzle ORM + better-auth + TanStack Query + Eden
**Target Stack:** Convex (DB + Functions + Auth + Real-time)

---

## Phase 1: Project Setup

- [x] 1.1 Create Convex Project
Create Convex project and configure monorepo structure.

**Requirements:**
- Create project on Convex dashboard
- Create `packages/convex/` directory with proper package.json
- Install deps: `convex`, `@convex-dev/auth`, `@auth/core`
- Configure `convex.json` for monorepo (set functions path)
- Add `CONVEX_URL` to env files (.env.local, .env.example)
- Add dev script: `"dev": "convex dev"` in packages/convex
- Verify `bunx convex dev` runs without errors

- [x] 1.2 Configure TypeScript for Convex
Set up TypeScript integration with Convex codegen.

**Requirements:**
- Add tsconfig.json in packages/convex extending base config
- Configure path aliases for generated types
- Run `convex dev` to generate `_generated/` folder
- Verify api types are accessible: `import { api } from "@repo/convex/_generated/api"`
- Add packages/convex to turborepo pipeline

---

## Phase 2: Database Schema

- [x] 2.1 Create Users Schema
Define users table with auth fields.

**Requirements:**
- Table: `users` with fields: name (string), email (string, indexed), emailVerified (bool), image (optional string), role (union: admin|user), banned (bool), banReason (optional), banExpires (optional timestamp)
- Index: `by_email` on email field
- Matches current auth.users structure (minus better-auth specific fields)

- [x] 2.2 Create Households Schema
Define household and membership tables.

**Requirements:**
- Table: `households` with fields: name (string), splitMode (union: equal|income_proportional)
- Table: `householdMembers` with fields: householdId (id ref), userId (id ref), joinedAt (timestamp)
- Indexes: `by_household` on householdId, `by_user` on userId
- Add compound index for membership lookup

- [x] 2.3 Create Invitations Schema
Define invitations table with status workflow.

**Requirements:**
- Table: `invitations` with fields: householdId (id ref), invitedBy (id ref), email (string), token (string), status (union: pending|accepted|declined|expired), expiresAt (timestamp)
- Indexes: `by_household`, `by_email`, `by_token`, `by_status`
- Token should be unique (validate in mutation)

- [x] 2.4 Create Financial Data Schemas
Define expenses, incomes, tags tables.

**Requirements:**
- Table: `expenses` with fields: userId, householdId (optional), tagId (optional), name, amount (integer, stored as cents - e.g., 1234 = $12.34), type (union: one_time|recurring), period (optional union: daily|weekly|monthly|yearly), startDate, endDate, targetDate (all optional strings), active (bool)
- Indexes on expenses: `by_user`, `by_household`, compound index for personal expenses
- Table: `incomes` with fields: userId, name, amount (integer, stored as cents), period (union), startDate, endDate (optional)
- Index: `by_user`
- Table: `tags` with fields: userId, name, color
- Index: `by_user`

- [x] 2.5 Create Snapshots Schema
Define snapshots table for archived monthly data.

**Requirements:**
- Table: `snapshots` with fields: userId, year, month, data (object with nested structure matching current SnapshotData type)
- Index: `by_user_month` on [userId, year, month]
- Data object validator matches: income, personalExpenses.total, personalExpenses.items[], householdShare.total, householdShare.items[], remaining

---

## Phase 3: Authentication

- [x] 3.1 Configure Convex Auth
Set up authentication with email/password and Google OAuth.

**Requirements:**
- Create `convex/auth.config.ts` with Password and Google providers
- Configure password reset email flow using Resend
- Set up Google OAuth with existing credentials
- Add required env vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Create `convex/auth.ts` with auth tables (Convex Auth generates these)
- Export auth helpers: `getAuthUserId`, `signIn`, `signOut`

- [x] 3.2 Implement Role-Based Access Control
Add role checking helper for admin/user roles.

**Requirements:**
- Create helper function `requireAuth(ctx)` that returns userId or throws
- Create helper `requireRole(ctx, role)` that checks user.role
- Add admin-only wrapper for functions needing admin access
- Test: regular user cannot access admin functions

- [x] 3.3 Add User Management Queries
Create user-related queries.

**Requirements:**
- Query `users.me`: returns current authenticated user or null
- Query `users.list` (admin only): returns all users
- Mutation `users.updateRole` (admin only): change user role
- Mutation `users.ban` (admin only): ban/unban user

---

## Phase 4: Core CRUD Functions

- [x] 4.1 Implement Income Functions
CRUD operations for incomes.

**Requirements:**
- Query `incomes.list`: get authenticated user's incomes ordered by creation desc
- Query `incomes.get(id)`: get single income (validate ownership)
- Mutation `incomes.create(data)`: create income with userId from auth
- Mutation `incomes.update(id, data)`: update income (validate ownership)
- Mutation `incomes.remove(id)`: delete income (validate ownership)
- Arg validation matches current incomeInsertSchema (name, amount, period, startDate, endDate optional)

- [x] 4.2 Implement Tag Functions
CRUD operations for tags.

**Requirements:**
- Query `tags.list`: get user's tags ordered by creation desc
- Mutation `tags.create(data)`: create tag with userId from auth
- Mutation `tags.update(id, data)`: update name/color (validate ownership)
- Mutation `tags.remove(id)`: delete tag (expenses with this tag should have tagId set to undefined - NOT deleted)
- Validate color is hex format

- [x] 4.3 Implement Personal Expense Functions
CRUD for personal expenses (no household).

**Requirements:**
- Query `expenses.list`: get user's personal expenses (householdId undefined)
- Query `expenses.get(id)`: get single expense with ownership check
- Mutation `expenses.create(data)`: validate type logic (one_time requires targetDate, recurring requires period+startDate)
- Mutation `expenses.update(id, data)`: validate type logic, ownership
- Mutation `expenses.remove(id)`: delete expense (validate ownership)
- Include tag data in list query (join manually)

- [ ] 4.4 Implement Household Expense Functions
CRUD for shared household expenses.

**Requirements:**
- Query `householdExpenses.list`: get expenses for user's household (must be member)
- Mutation `householdExpenses.create(data)`: create expense with householdId from user's membership
- Mutation `householdExpenses.update(id, data)`: validate user is household member
- Mutation `householdExpenses.remove(id)`: validate user is household member
- Same type validation as personal expenses

---

## Phase 5: Household & Invitation Functions

- [ ] 5.1 Implement Household Functions
Household CRUD and membership management.

**Requirements:**
- Query `households.me`: get user's household with members + user details
- Mutation `households.create(data)`: create household, auto-add creator as member, reject if user already in a household (409 equivalent)
- Mutation `households.update(id, data)`: update name/splitMode (validate membership)
- Mutation `households.leave(id)`: remove membership, disable user's household expenses (set active=false), delete household if empty (cascade delete expenses + invitations)

- [ ] 5.2 Implement Invitation Functions
Full invitation workflow.

**Requirements:**
- Query `invitations.list`: get pending invitations for user's household
- Query `invitations.pending`: get pending invitations sent to user's email
- Query `invitations.byToken(token)`: get invitation by token, update status to 'expired' if past expiresAt, return 410-equivalent if expired/used
- Mutation `invitations.send(email)`: validate sender is in household, prevent inviting existing members, prevent duplicate pending invitations, generate UUID token, set 7-day expiration
- Mutation `invitations.accept(token)`: validate user not already in household, add to household, mark invitation accepted
- Mutation `invitations.decline(token)`: mark invitation declined
- Mutation `invitations.revoke(id)`: delete invitation (validate sender is household member)

- [ ] 5.3 Add Email Sending Action
Send invitation emails via Resend.

**Requirements:**
- Create internal action `email.sendInvitation(to, inviterName, householdName, token)`
- Use existing Resend setup from packages/email
- Call action from invitations.send mutation using `ctx.scheduler.runAfter(0, ...)`
- Include invite URL in email with token
- Handle email sending failures gracefully (log but don't fail mutation)

---

## Phase 6: Balance & Stats Functions

- [ ] 6.1 Implement Balance Calculation Helpers
Port balance calculation logic from BalanceService.

**Requirements:**
- Helper `toMonthlyAmount(amount, period)`: convert daily/weekly/monthly/yearly to monthly (same formulas: daily×30.44, weekly×4.35, monthly×1, yearly÷12)
- Helper `isInMonth(dateStr, year, month)`: check if one-time date falls in month
- Helper `isActiveInMonth(startDate, endDate, year, month)`: check if recurring item spans month
- Helper `getExpenseMonthlyAmount(expense, year, month)`: calculate single expense's monthly impact
- All calculations done in cents (integers), frontend divides by 100 for display

- [ ] 6.2 Implement Monthly Balance Query
Main balance calculation endpoint.

**Requirements:**
- Query `balance.monthly(year, month)`: validate year 2000-2100, month 1-12
- Calculate: totalIncome (sum of active incomes), personalExpenses (total + items array), householdShare (total + items with yourShare)
- For household split: implement equal split (1/members) and income_proportional (userIncome/totalMembersIncome)
- Return: { year, month, income, personalExpenses: { total, items }, householdShare: { total, items }, remaining }

- [ ] 6.3 Implement Balance Projection Query
Project balance for future months.

**Requirements:**
- Query `balance.projection(year, month, monthsAhead)`: validate months 1-24
- Call monthly balance calculation for each month in range
- Return array of monthly balances

- [ ] 6.4 Implement Stats Functions
Statistics and aggregation queries.

**Requirements:**
- Query `stats.expensesByTag(year, month)`: aggregate personal expenses by tag, return array sorted by total desc, include tag color
- Query `stats.monthlyTrend(monthsBack)`: return expense totals for last N months (default 6), format: [{ year, month, total }]
- Handle null tags (group as "Uncategorized")

---

## Phase 7: Snapshot Functions

- [ ] 7.1 Implement Snapshot CRUD
Snapshot management for archived data.

**Requirements:**
- Query `snapshots.get(year, month)`: get snapshot for user + year/month, return null if not found
- Query `snapshots.list`: get all user's snapshots ordered by year/month desc
- Mutation `snapshots.archivePrevious`: calculate previous month's balance and save as snapshot (upsert logic)
- Internal helper to compute previous month from current date

---

## Phase 8: Frontend Migration

- [ ] 8.1 Set Up Convex Provider
Configure Convex client in frontend app.

**Requirements:**
- Install `convex` in apps/web
- Create ConvexReactClient with `VITE_CONVEX_URL`
- Wrap app with `ConvexAuthProvider` from @convex-dev/auth/react
- Remove QueryClientProvider (TanStack Query)
- Update env: add `VITE_CONVEX_URL`
- Verify Convex connection works

- [ ] 8.2 Update Auth Hooks
Replace better-auth hooks with Convex auth.

**Requirements:**
- Replace `authClient.useSession()` with `useConvexAuth()` + `useQuery(api.users.me)`
- Update login/signup forms to use Convex auth methods
- Update logout to use Convex signOut
- Update protected route logic with new auth state
- Remove `apps/web/src/lib/clients/auth-client.ts`

- [ ] 8.3 Migrate Query Components
Replace TanStack Query with Convex useQuery.

**Requirements:**
- Pattern change: `useQuery(someOptions())` → `useQuery(api.module.functionName, args)`
- Handle loading: `data === undefined` means loading (vs isLoading)
- Update all components using queries:
  - Expense list, income list, tag list
  - Household view, invitation list
  - Balance view, stats views
  - Snapshot views
- Remove query option files from `apps/web/src/lib/queries/`

- [ ] 8.4 Migrate Mutation Components
Replace TanStack mutations with Convex useMutation.

**Requirements:**
- Pattern change: `useMutation(options())` → `useMutation(api.module.functionName)`
- Remove manual cache invalidation (Convex auto-updates)
- Update all components using mutations:
  - CRUD forms for expenses, incomes, tags
  - Household create/update/leave
  - Invitation send/accept/decline/revoke
- Remove mutation option files from `apps/web/src/lib/mutations/`

- [ ] 8.5 Remove TanStack Query Dependencies
Clean up old data fetching code.

**Requirements:**
- Remove `@tanstack/react-query` from apps/web
- Remove `@elysiajs/eden` from apps/web
- Delete `apps/web/src/lib/queries/` directory
- Delete `apps/web/src/lib/mutations/` directory
- Delete `apps/web/src/lib/clients/eden-client.ts`
- Delete `apps/web/src/lib/server-fn/eden.ts`
- Update any remaining imports

---

## Phase 9: Cleanup

- [ ] 9.1 Remove Old Backend Packages
Delete replaced packages.

**Requirements:**
- Delete `packages/db/` entirely
- Delete `packages/server/` entirely
- Delete `packages/auth/` entirely
- Update root package.json workspaces
- Remove old package references from turbo.json
- Remove `@repo/db`, `@repo/auth` imports from any remaining code

- [ ] 9.2 Clean Up Environment Variables
Update env configuration.

**Requirements:**
- Remove: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- Keep: `RESEND_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FROM_EMAIL`, `FROM_NAME`
- Add: `CONVEX_URL`, `CONVEX_DEPLOY_KEY` (for CI)
- Update .env.example with new structure
- Update apps/web/src/lib/env.ts

- [ ] 9.3 Update Package Scripts
Clean up monorepo scripts.

**Requirements:**
- Remove from root: `db:push`, `db:migrate`, `db:gen`, `db:studio`
- Add to root: `convex:dev`, `convex:deploy`
- Update `dev` script to start Convex alongside web app
- Remove docker commands if PostgreSQL no longer needed
- Update CI/CD pipeline for Convex deployment

- [ ] 9.4 Update Documentation
Update README and CLAUDE.md.

**Requirements:**
- Update tech stack in README
- Update development commands
- Update CLAUDE.md with Convex patterns (schema, functions, frontend)
- Document new auth flow
- Remove Drizzle/Elysia references

---

## Phase 10: Testing & Verification

- [ ] 10.1 Test Auth Flows
Verify authentication works end-to-end.

**Requirements:**
- Test email/password signup → verify email shows in Convex dashboard
- Test email/password login → verify session created
- Test Google OAuth flow → verify account linked
- Test logout → verify session cleared
- Test password reset flow → verify email received
- Test role-based access (admin vs user)

- [ ] 10.2 Test CRUD Operations
Verify all data operations.

**Requirements:**
- Test income CRUD: create, list, update, delete
- Test expense CRUD (personal): create with types, list with tags, update, delete
- Test expense CRUD (household): create, list, update, delete as member
- Test tag CRUD: create, update, delete (verify expense.tagId cleared)
- Test household: create, update, leave (verify cascade)
- Test invitations: send, accept, decline, revoke, expiration

- [ ] 10.3 Test Balance & Stats
Verify calculations match previous implementation.

**Requirements:**
- Test monthly balance with mix of incomes and expenses
- Test equal split calculation
- Test income-proportional split calculation
- Test one-time vs recurring expense handling
- Test expense by tag aggregation
- Test monthly trend calculation
- Test snapshot archiving

- [ ] 10.4 Test Real-Time Updates
Verify Convex reactivity.

**Requirements:**
- Open app in two browsers as same user
- Create expense in one → verify appears in other without refresh
- Test with two household members → verify shared expense updates
- Verify no stale data issues

---

## Decisions Made

- **Amounts**: Store as cents (integers) for precision - e.g., 1234 for $12.34
- **Invitations expiration**: Check on read, no scheduled function needed
- **Package location**: `packages/convex/` to maintain monorepo consistency
