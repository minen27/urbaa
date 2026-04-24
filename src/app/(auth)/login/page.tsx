import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Sign in — Urba Chat',
  description: 'Sign in to your Urba Chat workspace',
}

export default function LoginPage() {
  return <LoginForm />
}
