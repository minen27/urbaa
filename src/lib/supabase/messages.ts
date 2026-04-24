import { getSupabaseBrowserClient } from './client'
import type { Message } from '@/types/message'

const MESSAGE_SELECT = `
  *,
  sender:profiles!sender_id(id, display_name, avatar_url, status),
  reactions(id, emoji, user_id),
  reply_to:messages!reply_to_id(
    id, content,
    sender:profiles!sender_id(display_name)
  )
`

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function fetchMessages(channelId: string, page = 0, pageSize = 40) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('messages')
    .select(MESSAGE_SELECT)
    .eq('channel_id', channelId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1)

  return { data: (data ?? []).reverse() as Message[], error }
}

// ─── Write ────────────────────────────────────────────────────────────────────

export async function sendMessage(payload: {
  channel_id: string
  sender_id: string
  content: string
  reply_to_id?: string | null
  file_url?: string | null
  file_type?: string | null
}) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('messages')
    .insert(payload)
    .select(MESSAGE_SELECT)
    .single()
  return { data: data as Message | null, error }
}

export async function editMessage(messageId: string, content: string) {
  const supabase = getSupabaseBrowserClient()
  return supabase
    .from('messages')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', messageId)
}

export async function softDeleteMessage(messageId: string) {
  const supabase = getSupabaseBrowserClient()
  return supabase
    .from('messages')
    .update({ is_deleted: true })
    .eq('id', messageId)
}

// ─── Reactions ────────────────────────────────────────────────────────────────

export async function toggleReaction(
  messageId: string,
  userId: string,
  emoji: string
) {
  const supabase = getSupabaseBrowserClient()

  const { data: existing } = await supabase
    .from('reactions')
    .select('id')
    .eq('message_id', messageId)
    .eq('user_id', userId)
    .eq('emoji', emoji)
    .maybeSingle()

  if (existing) {
    return supabase.from('reactions').delete().eq('id', existing.id)
  }
  return supabase
    .from('reactions')
    .insert({ message_id: messageId, user_id: userId, emoji })
}
