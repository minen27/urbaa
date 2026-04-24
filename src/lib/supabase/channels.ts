import { getSupabaseBrowserClient } from './client'
import type { Channel } from '@/types/channel'

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function fetchChannels(workspaceId: string) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .eq('workspace_id', workspaceId)
    .in('type', ['public', 'private'])
    .order('name')
  return { data: (data ?? []) as Channel[], error }
}

export async function fetchChannelById(channelId: string) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .eq('id', channelId)
    .single()
  return { data: data as Channel | null, error }
}

export async function fetchDMChannels(userId: string) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('channel_members')
    .select(`
      channel:channels!channel_id(
        id, name, type, workspace_id,
        members:channel_members(
          user:profiles!user_id(id, display_name, avatar_url, status)
        )
      )
    `)
    .eq('user_id', userId)
  // Filter to DM type on client (Supabase v2 can't filter joined table type inline)
  return { data: data ?? [], error }
}

export async function fetchChannelMembers(channelId: string) {
  const supabase = getSupabaseBrowserClient()
  return supabase
    .from('channel_members')
    .select('*, user:profiles!user_id(id, display_name, avatar_url, status)')
    .eq('channel_id', channelId)
}

// ─── Write ────────────────────────────────────────────────────────────────────

export async function createChannel(payload: {
  workspace_id: string
  name: string
  description?: string
  type: 'public' | 'private'
}) {
  const supabase = getSupabaseBrowserClient()
  const { data: channel, error } = await supabase
    .from('channels')
    .insert(payload)
    .select()
    .single()

  return { data: channel as Channel | null, error }
}

export async function joinChannel(channelId: string, userId: string) {
  return getSupabaseBrowserClient()
    .from('channel_members')
    .insert({ channel_id: channelId, user_id: userId })
}

export async function leaveChannel(channelId: string, userId: string) {
  return getSupabaseBrowserClient()
    .from('channel_members')
    .delete()
    .eq('channel_id', channelId)
    .eq('user_id', userId)
}

export async function updateChannel(
  channelId: string,
  updates: Partial<Pick<Channel, 'name' | 'description'>>
) {
  return getSupabaseBrowserClient()
    .from('channels')
    .update(updates)
    .eq('id', channelId)
}

export async function deleteChannel(channelId: string) {
  return getSupabaseBrowserClient()
    .from('channels')
    .delete()
    .eq('id', channelId)
}

/** Get or create a DM channel — calls a Supabase RPC */
export async function getOrCreateDMChannel(
  workspaceId: string,
  userA: string,
  userB: string
): Promise<string | null> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.rpc('get_or_create_dm_channel', {
    p_workspace_id: workspaceId,
    p_user_a: userA,
    p_user_b: userB,
  })
  if (error) { console.error(error); return null }
  return data as string
}
