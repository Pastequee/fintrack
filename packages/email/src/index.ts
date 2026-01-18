import { env } from '@repo/env/server'
import { Resend } from 'resend'

const resend = new Resend(env.RESEND_API_KEY)
const isDev = env.NODE_ENV === 'development'

type TemplateProps = {
	'reset-password': {
		URL: string
	}
}

type Template = keyof TemplateProps

type SendParams = {
	to: string | string[]
	subject: string
	text: string
}

function logEmail({ to, subject, text }: SendParams) {
	const toStr = Array.isArray(to) ? to.join(', ') : to
	const bodyIndented = text
		.split('\n')
		.map((l) => `     ${l}`)
		.join('\n')

	// biome-ignore lint/suspicious/noConsole: intentional dev-only logging
	console.log(`\n📧 [DEV] Email sent:
   To: ${toStr}
   Subject: ${subject}
   Body:
${bodyIndented}
`)
}

export const mail = {
	send: async ({ to, subject, text }: SendParams) => {
		if (isDev) {
			logEmail({ to, subject, text })
			return { data: { id: 'dev-mock-id' }, error: null }
		}

		const res = await resend.emails.send({
			from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
			to,
			subject,
			text,
		})

		return res
	},

	sendTemplate: async <TTemplate extends Template>(
		template: TTemplate,
		to: string,
		variables: TemplateProps[TTemplate]
	) =>
		resend.emails.send({
			from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
			to,
			template: { id: template, variables },
		}),

	sendInvitation: ({
		to,
		inviterName,
		householdName,
		token,
	}: {
		to: string
		inviterName: string
		householdName: string
		token: string
	}) => {
		const inviteUrl = `${env.FRONTEND_URL}/invite/${token}`
		const subject = `Invitation à rejoindre ${householdName}`
		const text = `${inviterName} vous invite à rejoindre le foyer "${householdName}" sur FinTrack.

Cliquez sur le lien ci-dessous pour accepter l'invitation:
${inviteUrl}

Ce lien expirera dans 7 jours.`

		return mail.send({ to, subject, text })
	},
}
