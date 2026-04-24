'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/utils/validators'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { OAuthButton } from './OAuthButton'
import { AdminLoginForm } from './AdminLoginForm'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/lib/stores/authStore'

type LoginTab = 'user' | 'admin'

export function LoginForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<LoginTab>('user')
  const { user, profile } = useAuthStore()

  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'admin') {
        if (!profile.password_changed) router.push('/admin-setup')
        else router.push('/dashboard')
      } else {
        router.push('/profile')
      }
    }
  }, [user, profile, router])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginFormData) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    })
    const json = await res.json()
    if (!res.ok) {
      toast.error(json.error ?? 'Sign in failed')
      return
    }
    // Redirection is handled by the useEffect above once the profile is loaded into the store
    router.refresh()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="card p-8 space-y-6"
    >
      {/* Logo / Brand */}
      <div className="text-center space-y-1">
        <div className="w-10 h-10 rounded-2xl bg-primary-400 flex items-center justify-center mx-auto mb-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Welcome back</h1>
        <p className="text-sm text-zinc-500">Sign in to your workspace</p>
      </div>

      {/* Tab switcher */}
      <div className="flex rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden p-1 gap-1 bg-zinc-50 dark:bg-zinc-800/50">
        {(['user', 'admin'] as LoginTab[]).map((tab) => (
          <button
            key={tab}
            id={`login-tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab
                ? tab === 'admin'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            {tab === 'user' ? 'User Login' : 'Admin Login'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'user' ? (
          <motion.div
            key="user"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <OAuthButton provider="google" />

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
              <span className="text-xs text-zinc-400">or continue with email</span>
              <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                id="email"
                {...register('email')}
                label="Email address"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                error={errors.email?.message}
              />
              <Input
                id="password"
                {...register('password')}
                label="Password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                error={errors.password?.message}
              />
              <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
                Sign in
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="admin"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            <AdminLoginForm />
          </motion.div>
        )}
      </AnimatePresence>

      {activeTab === 'user' && (
        <p className="text-center text-sm text-zinc-500">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary-500 font-medium hover:underline">
            Create one
          </Link>
        </p>
      )}
    </motion.div>
  )
}
