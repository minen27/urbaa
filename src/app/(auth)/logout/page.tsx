'use client'

import { useEffect } from 'react'

export default function LogoutPage() {
  useEffect(() => {
    fetch('/api/auth/logout', { method: 'POST' }).then(() => {
      window.location.href = '/login'
    })
  }, [])

  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="text-zinc-500">Signing out...</div>
    </div>
  )
}
