'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { ShieldCheck, Loader2 } from 'lucide-react'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export function AdminLoginForm() {
  const router = useRouter()
  const [adminId, setAdminId] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminId.trim()) {
      toast.error('Please enter your Admin ID')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id: adminId.trim() }),
      })
      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error ?? 'Invalid Admin ID')
        setIsLoading(false)
        return
      }

      // We have a temporary password from the backend!
      // Log in standardly on the client so cookies are set securely.
      const supabase = getSupabaseBrowserClient()
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: json.email,
        password: json.tempPassword,
      })

      if (signInErr) {
        toast.error('Authentication failed')
        setIsLoading(false)
        return
      }

      // Success! Push directly to the correct page using Next.js router
      router.push(json.firstLogin ? '/admin-setup' : '/dashboard')
      router.refresh()
    } catch {
      toast.error('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Icon + heading */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mx-auto">
          <ShieldCheck size={22} className="text-violet-500" />
        </div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Admin access
        </h2>
        <p className="text-xs text-zinc-400">
          Enter your unique Admin ID to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="admin-id-input"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Admin ID
          </label>
          <input
            id="admin-id-input"
            type="text"
            autoComplete="off"
            autoFocus
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            placeholder="e.g. ADMIN_001"
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-colors"
          />
        </div>

        <button
          id="admin-login-submit"
          type="submit"
          disabled={isLoading || !adminId.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Verifying…
            </>
          ) : (
            'Continue'
          )}
        </button>
      </form>

      <p className="text-center text-xs text-zinc-400">
        Admin access only — contact your system administrator if you need help.
      </p>
    </motion.div>
  )
}
