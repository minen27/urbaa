import { getSupabaseBrowserClient } from './client'
import type { Message } from '@/types/message'

type MessageHandler = (msg: Message) => void
type DeleteHandler  = (id: string) => void
type TypingPayload  = { userId: string; displayName: string; isTyping: boolean }
type TypingHandler  = (p: TypingPayload) => void

// ─── Message Realtime ─────────────────────────────────────────────────────────

/**
 * Subscribe to INSERT / UPDATE / DELETE on messages for a channel.
 * Returns a cleanup function.
 */
export function subscribeToMessages(
  channelId: string,
  onInsert: MessageHandler,
  onUpdate: MessageHandler,
  onDelete: DeleteHandler
): () => void {
  const supabase = getSupabaseBrowserClient()

  const sub = supabase
    .channel(`messages:${channelId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${channelId}`,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (payload: any) => onInsert(payload.new as Message)
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${channelId}`,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (payload: any) => onUpdate(payload.new as Message)
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'messages',
        filter: `channel_id=eq.${channelId}`,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (payload: any) => onDelete((payload.old as { id: string }).id)
    )
    .subscribe()

  return () => { supabase.removeChannel(sub) }
}

// ─── Typing Indicator (ephemeral broadcast) ───────────────────────────────────

export function subscribeToTyping(
  channelId: string,
  onTyping: TypingHandler
): { unsubscribe: () => void; sendTyping: (userId: string, displayName: string, isTyping: boolean) => void } {
  const supabase = getSupabaseBrowserClient()

  const channel = supabase
    .channel(`typing:${channelId}`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .on('broadcast', { event: 'typing' }, (msg: any) =>
      onTyping(msg.payload as TypingPayload)
    )
    .subscribe()

  const sendTyping = (userId: string, displayName: string, isTyping: boolean) =>
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId, displayName, isTyping },
    })

  return {
    unsubscribe: () => supabase.removeChannel(channel),
    sendTyping,
  }
}

// ─── Presence (online users) ──────────────────────────────────────────────────

export function subscribeToPresence(
  roomId: string,
  userId: string,
  onSync: (onlineUserIds: string[]) => void
): () => void {
  const supabase = getSupabaseBrowserClient()

  const channel = supabase.channel(`presence:${roomId}`)

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState() as Record<string, { user_id: string }[]>
      const ids = Object.values(state).flat().map((p) => p.user_id)
      onSync(ids)
    })
    .subscribe(async (status: string) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ user_id: userId, online_at: new Date().toISOString() })
      }
    })

  return () => { supabase.removeChannel(channel) }
}
