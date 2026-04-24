import { getSupabaseBrowserClient } from './client'

export async function searchMessages(query: string, workspaceId: string) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('messages')
    .select(`
      id, content, created_at,
      channel:channels!channel_id(id, name, workspace_id),
      sender:profiles!sender_id(display_name, avatar_url)
    `)
    .textSearch('content_fts', query, { type: 'websearch', config: 'english' })
    .eq('is_deleted', false)
    .limit(25)

  // Filter by workspace client-side (channel join filtered by workspace_id)
  const filtered = (data ?? []).filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (m: any) => m.channel?.workspace_id === workspaceId
  )

  return { data: filtered, error }
}

export async function searchChannels(query: string, workspaceId: string) {
  const supabase = getSupabaseBrowserClient()
  return supabase
    .from('channels')
    .select('id, name, description, type')
    .eq('workspace_id', workspaceId)
    .ilike('name', `%${query}%`)
    .limit(10)
}

export async function searchUsers(query: string) {
  const supabase = getSupabaseBrowserClient()
  return supabase
    .from('profiles')
    .select('id, display_name, avatar_url, status')
    .ilike('display_name', `%${query}%`)
    .limit(10)
}
