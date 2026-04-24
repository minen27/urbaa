import type { Metadata } from 'next'
import { UserTable } from '@/components/admin/UserTable'
import Link from 'next/link'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Admin — Users | Urba Chat' }

async function requireAdmin() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/workspace')
}

export default async function AdminUsersPage() {
  await requireAdmin()

  return (
    <div className="flex flex-col h-full overflow-auto">
      <header className="px-6 py-4 border-b border-[var(--border)] shrink-0 flex items-center gap-6">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Admin Panel</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/admin" className="font-medium text-primary-500 border-b-2 border-primary-400 pb-px">Users</Link>
          <Link href="/admin/channels" className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">Channels</Link>
        </nav>
      </header>

      <main className="flex-1 px-6 py-6">
        <div className="card p-6">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">All Users</h2>
          <UserTable />
        </div>
      </main>
    </div>
  )
}
