import cors from '@elysiajs/cors'
import { auth } from '@repo/auth'
import { env } from '@repo/env/server'
import { Elysia } from 'elysia'
import { devLogger } from '#lib/dev-logger'
import { balanceRouter } from '#routers/balance/controller'
import { expensesRouter } from '#routers/expense/controller'
import { householdsRouter } from '#routers/household/controller'
import { incomesRouter } from '#routers/income/controller'
import { invitationsRouter } from '#routers/invitation/controller'
import { snapshotsRouter } from '#routers/snapshot/controller'
import { statsRouter } from '#routers/stats/controller'
import { tagsRouter } from '#routers/tag/controller'
import { userRouter } from '#routers/user/controller'
import { utilsRouter } from '#routers/utils/controller'

export const app = new Elysia({ prefix: '/api' })
	.use(
		cors({
			origin: [env.FRONTEND_URL],
			methods: ['GET', 'POST', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
			credentials: true,
			allowedHeaders: ['Content-Type', 'Authorization'],
		})
	)
	.use(devLogger()) // Enabled only in development
	// .use(
	// 	openapi({
	// 		enabled: !isProduction,
	// 		documentation: {
	// 			components: await AuthOpenAPI.components,
	// 			paths: await AuthOpenAPI.getPaths(),
	// 		},
	// 		references: fromTypes('src/index.ts'),
	// 	})
	// )
	.use(utilsRouter)
	.mount(auth.handler)
	.use(userRouter)
	.use(incomesRouter)
	.use(expensesRouter)
	.use(householdsRouter)
	.use(invitationsRouter)
	.use(balanceRouter)
	.use(snapshotsRouter)
	.use(statsRouter)
	.use(tagsRouter)

// app.listen(3001, (server) => {
// 	process.on('SIGTERM', async () => {
// 		await app.stop()
// 		process.exit(0)
// 	})

// 	process.on('SIGINT', async () => {
// 		await app.stop()
// 		process.exit(0)
// 	})

// 	logger.info(
// 		{
// 			url: server?.url,
// 			environment: env.NODE_ENV,
// 			port: server?.port,
// 			hostname: server?.hostname,
// 		},
// 		'Server is running'
// 	)
// })

export type App = typeof app
