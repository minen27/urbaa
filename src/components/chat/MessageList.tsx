'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageBubble } from './MessageBubble'
import { DateDivider } from './DateDivider'
import { useMessages } from '@/lib/hooks/useMessages'
import { useMessageStore } from '@/lib/stores/messageStore'
import { useChannelStore } from '@/lib/stores/channelStore'
import { isSameDay } from '@/lib/utils/formatDate'
import { Loader2 } from 'lucide-react'
import type { Message } from '@/types/message'

interface MessageListProps {
  channelId: string
  onReply?: (msg: Message) => void
}

export function MessageList({ channelId, onReply }: MessageListProps) {
  const { fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useMessages(channelId)
  const { messagesByChannel } = useMessageStore()
  const { clearUnread } = useChannelStore()
  const bottomRef = useRef<HTMLDivElement>(null)
  const isFirstLoad = useRef(true)

  const { ref: topRef, inView: topInView } = useInView({ threshold: 0 })

  const messages = messagesByChannel[channelId] ?? []

  // Load older messages on scroll to top
  useEffect(() => {
    if (topInView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [topInView, hasNextPage, isFetchingNextPage, fetchNextPage])

  // Scroll to bottom on first load and new messages
  useEffect(() => {
    if (isFirstLoad.current && messages.length > 0) {
      bottomRef.current?.scrollIntoView()
      isFirstLoad.current = false
      clearUnread(channelId)
    }
  }, [messages, channelId, clearUnread])

  // Scroll to bottom when a new message arrives (only if near bottom)
  const lastMsgId = messages[messages.length - 1]?.id
  useEffect(() => {
    if (!isFirstLoad.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMsgId])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-400" size={24} />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
      {/* Infinite scroll sentinel */}
      <div ref={topRef} className="h-1" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-2">
          <Loader2 className="animate-spin text-zinc-400" size={16} />
        </div>
      )}

      <AnimatePresence initial={false}>
        {messages.map((msg, i) => {
          const showDivider = i === 0 || !isSameDay(messages[i - 1].created_at, msg.created_at)
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
            >
              {showDivider && <DateDivider date={msg.created_at} />}
              <MessageBubble
                message={msg}
                channelId={channelId}
                onReply={onReply}
              />
            </motion.div>
          )
        })}
      </AnimatePresence>

      <div ref={bottomRef} className="h-2" />
    </div>
  )
}
