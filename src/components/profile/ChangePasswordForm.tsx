'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Eye, EyeOff } from 'lucide-react'

const schema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'Must be at least 8 characters'),
  confirm_password: z.string()
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
})

type FormData = z.infer<typeof schema>

export function ChangePasswordForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data: FormData) => {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const json = await res.json()
    
    if (!res.ok) {
      toast.error(json.error ?? 'Failed to update password')
      return
    }
    
    toast.success('Password updated successfully')
    reset()
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 mt-5">
      <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-4 flex items-center gap-2">
        <Lock size={16} className="text-violet-500" /> Security
      </h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Current Password</label>
          <input
            {...register('current_password')}
            type={showPassword ? 'text' : 'password'}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-400 text-zinc-900 dark:text-zinc-100"
          />
          {errors.current_password && <p className="text-xs text-red-500 mt-1">{errors.current_password.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">New Password</label>
          <input
            {...register('new_password')}
            type={showPassword ? 'text' : 'password'}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-400 text-zinc-900 dark:text-zinc-100"
          />
          {errors.new_password && <p className="text-xs text-red-500 mt-1">{errors.new_password.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Confirm New Password</label>
          <div className="relative">
            <input
              {...register('confirm_password')}
              type={showPassword ? 'text' : 'password'}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-violet-400 text-zinc-900 dark:text-zinc-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirm_password && <p className="text-xs text-red-500 mt-1">{errors.confirm_password.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
        >
          {isSubmitting ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}
