import { v } from 'convex/values'
import { Resend } from 'resend'
import { internalAction } from './_generated/server'

const resend = new Resend(process.env.AUTH_RESEND_KEY)

/**
 * Send invitation email to join a household.
 * Called from invitations.send mutation via scheduler.
 */
export const sendInvitation = internalAction({
	args: {
		to: v.string(),
		inviterName: v.string(),
		householdName: v.string(),
		token: v.string(),
	},
	handler: async (_, args) => {
		const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000'
		const inviteUrl = `${frontendUrl}/invite/${args.token}`

		const subject = `Invitation à rejoindre ${args.householdName}`
		const text = `${args.inviterName} vous invite à rejoindre le foyer "${args.householdName}" sur FinTrack.

Cliquez sur le lien ci-dessous pour accepter l'invitation:
${inviteUrl}

Ce lien expirera dans 7 jours.`

		try {
			const { error } = await resend.emails.send({
				from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
				to: args.to,
				subject,
				text,
			})

			if (error) {
				// biome-ignore lint/suspicious/noConsole: intentional logging for email failures
				console.error('Failed to send invitation email:', error)
				return { success: false, error: error.message }
			}

			return { success: true }
		} catch (err) {
			// biome-ignore lint/suspicious/noConsole: intentional logging for email failures
			console.error('Unexpected error sending invitation email:', err)
			return { success: false, error: String(err) }
		}
	},
})
