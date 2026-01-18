import { app } from '@repo/server'
import { createFileRoute } from '@tanstack/react-router'

const handler = ({ request }: { request: Request }) => app.fetch(request)

export const Route = createFileRoute('/api/$')({
	server: {
		handlers: {
			GET: handler,
			POST: handler,
			PATCH: handler,
			DELETE: handler,
		},
	},
})
