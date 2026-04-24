'use client'

import { useEffect, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchMessages } from '@/lib/supabase/messages'
import { subscribeToMessages } from '@/lib/supabase/realtime'
import { useMessageStore } from '@/lib/stores/messageStore'
import { useChannelStore } from '@/lib/stores/channelStore'
import { useAuthStore } from '@/lib/stores/authStore'
import { toast } from 'sonner'
import type { Message } from '@/types/message'

const PAGE_SIZE = 40

export function useMessages(channelId: string) {
  const { upsertMessage, deleteMessage, setMessages } = useMessageStore()
  const { activeChannelId, incrementUnread } = useChannelStore()
  const { user } = useAuthStore()

  // ── React Query: paginated fetch ────────────────────────────────────────────
  const query = useInfiniteQuery({
    queryKey: ['messages', channelId],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await fetch(`/api/messages?channelId=${channelId}&page=${pageParam}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return { data: json.data, page: pageParam as number }
    },
    getNextPageParam: (lastPage) =>
      lastPage.data.length === PAGE_SIZE ? lastPage.page + 1 : undefined,
    initialPageParam: 0,
    staleTime: 1000 * 30,
  })

  // Sync first page into Zustand
  useEffect(() => {
    if (query.data?.pages[0]) {
      setMessages(channelId, query.data.pages.flatMap((p) => p.data))
    }
  }, [query.data, channelId, setMessages])

  // ── Realtime subscription ───────────────────────────────────────────────────
  const activeChannelRef = useRef(activeChannelId)
  useEffect(() => { activeChannelRef.current = activeChannelId }, [activeChannelId])

  useEffect(() => {
    const unsub = subscribeToMessages(
      channelId,
      async (msg: Message) => {
        // Realtime payload won't have the 'sender' join. Fetch it if missing.
        let fullMsg = { ...msg }
        if (!fullMsg.sender) {
          try {
            const res = await fetch(`/api/users/profile?id=${msg.user_id || (msg as any).sender_id}`)
            const json = await res.json()
            if (json.data) fullMsg.sender = json.data
          } catch (e) { console.error('Failed to fetch sender profile for realtime msg') }
        }

        // Only show toast + increment unread if not the active channel
        if (activeChannelRef.current !== channelId) {
          incrementUnread(channelId)
          toast(`New message in #${channelId}`, {
            description: (fullMsg.content || 'Sent a file').slice(0, 80),
          })
        }
        upsertMessage(channelId, fullMsg)
      },
      (msg: Message) => upsertMessage(channelId, msg),
      (id: string)  => deleteMessage(channelId, id)
    )
    return unsub
  }, [channelId, upsertMessage, deleteMessage, incrementUnread])

  return query
}
