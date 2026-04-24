'use client'

import { useEffect } from 'react'
import { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { useAuthStore } from '@/lib/stores/authStore'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

async function fetchMyProfile() {
  try {
    const res = await fetch('/api/profile/me')
    if (!res.ok) return null
    return await res.json() // { profile, email, id }
  } catch {
    return null
  }
}

export function useAuth() {
  const { user, profile, setUser, setProfile, setLoading, logout } = useAuthStore()

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    const initSession = async () => {
      const data = await fetchMyProfile()
      if (data?.profile) {
        setUser({ id: data.id, email: data.email, profile: data.profile })
        setProfile(data.profile)
      }
      setLoading(false)
    }

    initSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_IN') {
        // Small delay to ensure session cookies are set
        setTimeout(async () => {
          const data = await fetchMyProfile()
          if (data?.profile) {
            setUser({ id: data.id, email: data.email, profile: data.profile })
            setProfile(data.profile)
          }
        }, 500)
      } else if (event === 'SIGNED_OUT') {
        logout()
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setProfile, setLoading, logout])

  return { user, profile, isLoading: useAuthStore((s) => s.isLoading) }
}
