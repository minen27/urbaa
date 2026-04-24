import type { Metadata } from 'next'
import { VerifyEmailForm } from '@/components/auth/VerifyEmailForm'

export const metadata: Metadata = {
  title: 'Verify Email — Urba Chat',
  description: 'Verify your Urba Chat account with a PIN',
}

export default function VerifyEmailPage() {
  return <VerifyEmailForm />
}
