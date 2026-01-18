import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import z from 'zod'
import { RegisterForm } from '~/components/auth/register-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

const searchSchema = z.object({
	redirect: z.string().optional(),
})

export const Route = createFileRoute('/_auth/register')({
	component: RegisterPage,
	validateSearch: searchSchema,
})

function RegisterPage() {
	const { redirect } = Route.useSearch()

	return (
		<Card className="w-md max-w-[90vw]">
			<CardHeader>
				<CardTitle>Create an account</CardTitle>
				<CardDescription>
					We are happy that you want to join us. Please fill in the form below to create your
					account.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<RegisterForm redirect={redirect} />

				<p className="mt-4 flex flex-wrap justify-center gap-1 text-muted-foreground text-sm">
					Already have an account?{' '}
					<Link className="flex items-center gap-1 text-primary" search={{ redirect }} to="/login">
						Sign in <ArrowRight size={14} />
					</Link>
				</p>
			</CardContent>
		</Card>
	)
}
