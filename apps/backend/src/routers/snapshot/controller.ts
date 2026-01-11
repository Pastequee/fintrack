import { Elysia, t } from 'elysia'
import { betterAuth } from '#middlewares/auth'
import { SnapshotsService } from './service'

export const snapshotsRouter = new Elysia({ name: 'snapshots', tags: ['Snapshots'] })
	.use(betterAuth)
	.get(
		'/snapshots/:year/:month',
		({ params, user }) => SnapshotsService.getSnapshot(user.id, params.year, params.month),
		{
			auth: true,
			params: t.Object({
				year: t.Numeric({ minimum: 2000, maximum: 2100 }),
				month: t.Numeric({ minimum: 1, maximum: 12 }),
			}),
		}
	)
	.post(
		'/snapshots/archive-previous',
		({ user }) => SnapshotsService.archivePreviousMonth(user.id),
		{
			auth: true,
		}
	)
	.get('/snapshots', ({ user }) => SnapshotsService.getUserSnapshots(user.id), {
		auth: true,
	})
