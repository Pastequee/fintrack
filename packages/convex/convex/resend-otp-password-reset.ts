import Resend from '@auth/core/providers/resend'
import type { RandomReader } from '@oslojs/crypto/random'
import { generateRandomString } from '@oslojs/crypto/random'
import { Resend as ResendAPI } from 'resend'

const random: RandomReader = {
	read(bytes: Uint8Array) {
		crypto.getRandomValues(bytes)
	},
}

export const ResendOTPPasswordReset = Resend({
	id: 'resend-otp',
	apiKey: process.env.AUTH_RESEND_KEY,
	generateVerificationToken() {
		return generateRandomString(random, '0123456789', 8)
	},
	async sendVerificationRequest({ identifier: email, provider, token }) {
		const resend = new ResendAPI(provider.apiKey)
		const { error } = await resend.emails.send({
			from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
			to: [email],
			subject: 'Reset your FinTrack password',
			text: `Your password reset code is: ${token}\n\nThis code will expire in 1 hour.`,
		})
		if (error) {
			throw new Error('Could not send password reset email')
		}
	},
})
