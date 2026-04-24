import type { Metadata } from 'next'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MainLayoutClient } from '@/components/layout/MainLayoutClient'

export const metadata: Metadata = {
  title: 'Urba Chat',
  description: 'Team messaging for your workspace',
}

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <MainLayoutClient>{children}</MainLayoutClient>
}
