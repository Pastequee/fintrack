import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import z from 'zod'

import { LoginForm } from '~/components/auth/login-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

const searchSchema = z.object({
	redirect: z.string().optional(),
})

export const Route = createFileRoute('/_auth/login')({
	component: LoginPage,
	validateSearch: searchSchema,
})

function LoginPage() {
	const { redirect } = Route.useSearch()

	return (
		<Card className="w-md max-w-[90vw]">
			<CardHeader>
				<CardTitle>Welcome back</CardTitle>
				<CardDescription>Please enter your credentials to sign in.</CardDescription>
			</CardHeader>
			<CardContent>
				<LoginForm redirect={redirect} />
				<p className="mt-4 flex flex-wrap justify-center gap-1 text-muted-foreground text-sm">
					Don&apos;t have an account yet?{' '}
					<Link
						className="flex items-center gap-1 text-primary"
						search={{ redirect }}
						to="/register"
					>
						Create an account <ArrowRight size={14} />
					</Link>
				</p>
			</CardContent>
		</Card>
	)
}
