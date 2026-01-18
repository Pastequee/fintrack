import { treaty } from '@elysiajs/eden'
import { env } from '@repo/env/web'
import type { App } from '@repo/server'
import { createIsomorphicFn } from '@tanstack/react-start'

export const eden = createIsomorphicFn()
	// Optimize the server call by removing the http call overhead and directly call the app function
	// But there is a bug for now, so we use the treaty function for now
	// .server(() => treaty(app).api)
	.server(() => treaty<App>(env.VITE_SERVER_URL).api)
	.client(() => treaty<App>(env.VITE_SERVER_URL).api)
