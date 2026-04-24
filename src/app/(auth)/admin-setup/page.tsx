'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Eye, EyeOff, Check } from 'lucide-react'

const setupSchema = z.object({
  display_name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

type SetupFormData = z.infer<typeof setupSchema>

const STEPS = ['Display Name', 'Email', 'Password'] as const

export default function AdminSetupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SetupFormData>({ resolver: zodResolver(setupSchema), mode: 'onChange' })

  const displayName = watch('display_name', '')
  const email = watch('email', '')
  const password = watch('password', '')

  // Simple step completion check for the progress bar
  const completedSteps = [
    displayName.length >= 2,
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    password.length >= 8,
  ]
  const completedCount = completedSteps.filter(Boolean).length

  const onSubmit = async (data: SetupFormData) => {
    const res = await fetch('/api/auth/admin-setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        display_name: data.display_name,
        email: data.email,
        password: data.password,
      }),
    })
    const json = await res.json()

    if (!res.ok) {
      toast.error(json.error ?? 'Setup failed. Please try again.')
      return
    }

    toast.success('Account configured! Redirecting to your dashboard…')
    setTimeout(() => router.push('/dashboard'), 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 p-8 space-y-7"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mx-auto">
            <ShieldCheck size={22} className="text-violet-500" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Welcome, Admin
          </h1>
          <p className="text-sm text-zinc-500">
            Complete your account setup before accessing the dashboard.
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>{completedCount} of {STEPS.length} fields complete</span>
            <span>{Math.round((completedCount / STEPS.length) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-violet-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / STEPS.length) * 100}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            />
          </div>
          <div className="flex gap-2">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-1.5 text-xs">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                  completedSteps[i]
                    ? 'bg-violet-500 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                }`}>
                  {completedSteps[i] ? <Check size={10} strokeWidth={3} /> : null}
                </div>
                <span className={completedSteps[i] ? 'text-violet-600 dark:text-violet-400' : 'text-zinc-400'}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Display Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Display Name
            </label>
            <input
              id="setup-display-name"
              {...register('display_name')}
              placeholder="Your name"
              autoComplete="name"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-colors"
            />
            {errors.display_name && (
              <p className="text-xs text-red-500">{errors.display_name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email Address
            </label>
            <input
              id="setup-email"
              {...register('email')}
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-colors"
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              New Password
            </label>
            <div className="relative">
              <input
                id="setup-password"
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                className="w-full px-4 py-3 pr-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="setup-confirm-password"
                {...register('confirm_password')}
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full px-4 py-3 pr-11 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="text-xs text-red-500">{errors.confirm_password.message}</p>
            )}
          </div>

          <button
            id="admin-setup-submit"
            type="submit"
            disabled={isSubmitting || completedCount < STEPS.length}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
          >
            {isSubmitting ? 'Saving…' : 'Save & Continue'}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-400">
          You must complete this setup before accessing the dashboard.
        </p>
      </motion.div>
    </div>
  )
}
