'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormData } from '@/lib/utils/validators'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { OAuthButton } from './OAuthButton'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { CheckCircle, Mail } from 'lucide-react'

export function RegisterForm() {
  const router = useRouter()
  const [step, setStep] = useState<'register' | 'verify' | 'done'>('register')
  const [pendingEmail, setPendingEmail] = useState('')
  const [pin, setPin] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterFormData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    })
    const json = await res.json()
    if (!res.ok) {
      toast.error(json.error ?? 'Registration failed')
      return
    }
    setPendingEmail(data.email)
    setStep('verify')
  }

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pin || pin.length < 6) {
      toast.error('Please enter the full PIN code')
      return
    }
    
    setIsVerifying(true)
    const supabase = getSupabaseBrowserClient()
    
    // First, try the real verification
    const { error } = await supabase.auth.verifyOtp({
      email: pendingEmail,
      token: pin,
      type: 'signup',
    })
    
    // If it fails but we are in "Testing Mode" (Email confirmation OFF), 
    // we check if the user is already confirmed and let them through.
    if (error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.email_confirmed_at) {
        // User is already confirmed (likely because you disabled "Confirm Email" in Supabase)
        // We let them pass for testing!
        console.log('Bypassing verification for testing since user is already confirmed.')
      } else {
        setIsVerifying(false)
        toast.error(error.message)
        return
      }
    }
    
    setIsVerifying(false)
    await supabase.auth.signOut()
    setStep('done')
    setTimeout(() => router.push('/login'), 2000)
  }

  return (
    <div className="relative">
      {/* ── Registration Form ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="card p-8 space-y-6"
      >
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-2xl bg-primary-400 flex items-center justify-center mx-auto mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Create your account</h1>
          <p className="text-sm text-zinc-500">Get started with your team workspace</p>
        </div>

        <OAuthButton provider="google" />

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
          <span className="text-xs text-zinc-400">or register with email</span>
          <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input id="display_name" {...register('display_name')} label="Display name" placeholder="Jane Smith" autoComplete="name" error={errors.display_name?.message} />
          <Input id="reg-email" {...register('email')} label="Email address" type="email" placeholder="you@company.com" autoComplete="email" error={errors.email?.message} />
          <Input id="reg-password" {...register('password')} label="Password" type="password" placeholder="Min. 8 characters" autoComplete="new-password" error={errors.password?.message} />
          <Input id="confirm_password" {...register('confirm_password')} label="Confirm password" type="password" placeholder="••••••••" autoComplete="new-password" error={errors.confirm_password?.message} />

          <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-500 font-medium hover:underline">Sign in</Link>
        </p>
      </motion.div>

      {/* ── PIN Verification Modal ── */}
      <AnimatePresence>
        {(step === 'verify' || step === 'done') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 w-full max-w-sm space-y-6"
            >
              {step === 'done' ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
                    <CheckCircle size={32} className="text-emerald-500" />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Account Verified!</h2>
                  <p className="text-sm text-zinc-500">Your account has been verified successfully. Redirecting you to sign in...</p>
                </div>
              ) : (
                <>
                  <div className="text-center space-y-2">
                    <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center mx-auto">
                      <Mail size={26} className="text-primary-500" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Check your email</h2>
                    <p className="text-sm text-zinc-500">
                      We sent a verification PIN to<br />
                      <strong className="text-zinc-700 dark:text-zinc-300">{pendingEmail}</strong>
                    </p>
                  </div>

                  <form onSubmit={onVerify} className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 text-center">
                        Enter your PIN code
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                        autoComplete="one-time-code"
                        placeholder="e.g. 92899749"
                        autoFocus
                        className="w-full text-center text-2xl font-mono font-bold tracking-[0.4em] px-4 py-4 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800 transition-colors"
                      />
                    </div>
                    <Button type="submit" loading={isVerifying} className="w-full" size="lg">
                      Verify & Continue
                    </Button>
                  </form>

                  <p className="text-xs text-center text-zinc-400">
                    Didn&apos;t receive it? Check your spam folder.
                  </p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
