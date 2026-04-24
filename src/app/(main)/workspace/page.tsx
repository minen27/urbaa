import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'

const DEFAULT_WORKSPACE_ID = process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID ?? 'default'

export default async function WorkspacePage() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Redirect to the first channel in the workspace
  const { data: channels } = await supabase
    .from('channels')
    .select('id')
    .eq('workspace_id', DEFAULT_WORKSPACE_ID)
    .in('type', ['public', 'private'])
    .order('name')
    .limit(1)

  if (channels && channels.length > 0) {
    redirect(`/workspace/${DEFAULT_WORKSPACE_ID}/channel/${channels[0].id}`)
  }

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-500">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">No channels yet</h2>
        <p className="text-sm text-zinc-500">Create your first channel using the sidebar to get started.</p>
      </div>
    </div>
  )
}
