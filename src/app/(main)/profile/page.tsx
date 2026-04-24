import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm'

export const metadata: Metadata = {
  title: 'Profile & Settings — Urba Chat',
}

export default async function ProfilePage() {
  const supabase = await getSupabaseServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <div className="flex flex-col h-full overflow-auto" style={{ background: 'var(--bg-page)' }}>
      <header className="px-6 py-4 border-b border-[var(--border)] shrink-0 bg-white dark:bg-zinc-950">
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">My Profile</h1>
        <p className="text-sm text-zinc-500 mt-0.5">View your account details and preferences</p>
      </header>
      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full space-y-5">
        <ProfileForm
          initialProfile={profile}
          userEmail={user.email ?? ''}
          userId={user.id}
        />
        <ChangePasswordForm />
      </main>
    </div>
  )
}
