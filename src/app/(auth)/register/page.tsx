import type { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Create account — Urba Chat',
  description: 'Create your Urba Chat account',
}

export default function RegisterPage() {
  return <RegisterForm />
}
