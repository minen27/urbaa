'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

export function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  
  const [token, setToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || token.length < 6) {
      toast.error('Please enter a valid PIN (6-8 digits)')
      return
    }

    setIsLoading(true)
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    })
    
    if (error) {
      setIsLoading(false)
      toast.error(error.message)
      return
    }

    toast.success('Your account has been verified successfully!')
    
    // Give time for the toast to be seen before redirecting
    setTimeout(() => {
      router.push('/workspace')
      router.refresh()
    }, 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="card p-8 space-y-6"
    >
      <div className="text-center space-y-1">
        <div className="w-10 h-10 rounded-2xl bg-primary-400 flex items-center justify-center mx-auto mb-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Verify your email</h1>
        <p className="text-sm text-zinc-500 text-pretty">
          We sent a verification PIN to <strong>{email}</strong>. Please enter it below to activate your account.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          id="pin"
          label="Verification PIN"
          placeholder="Enter PIN from email"
          maxLength={10}
          value={token}
          onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, ''))}
          autoComplete="one-time-code"
          className="text-center text-lg tracking-[0.5em] font-mono"
        />

        <Button type="submit" loading={isLoading} className="w-full" size="lg">
          Verify Account
        </Button>
      </form>
    </motion.div>
  )
}
