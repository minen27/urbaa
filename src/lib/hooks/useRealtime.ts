'use client'

import { useState, useEffect, useRef } from 'react'
import { subscribeToTyping } from '@/lib/supabase/realtime'
import type { TypingUser } from '@/types/message'

export function useTypingIndicator(channelId: string, currentUserId: string, currentDisplayName: string) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const sendTypingRef = useRef<(uid: string, name: string, typing: boolean) => void>(() => {})
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const { unsubscribe, sendTyping } = subscribeToTyping(channelId, (payload) => {
      if (payload.userId === currentUserId) return

      setTypingUsers((prev) => {
        if (payload.isTyping) {
          const exists = prev.find((u) => u.userId === payload.userId)
          if (exists) return prev
          return [...prev, { userId: payload.userId, displayName: payload.displayName }]
        } else {
          return prev.filter((u) => u.userId !== payload.userId)
        }
      })
    })

    sendTypingRef.current = sendTyping
    return unsubscribe
  }, [channelId, currentUserId])

  const onType = () => {
    sendTypingRef.current(currentUserId, currentDisplayName, true)
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingRef.current(currentUserId, currentDisplayName, false)
    }, 2500)
  }

  const onBlur = () => {
    clearTimeout(typingTimeoutRef.current)
    sendTypingRef.current(currentUserId, currentDisplayName, false)
  }

  return { typingUsers, onType, onBlur }
}
