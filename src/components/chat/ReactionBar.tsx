'use client'

import { toggleReaction } from '@/lib/supabase/messages'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils/cn'
import type { Reaction, ReactionGroup } from '@/types/message'
import { useMemo } from 'react'

interface ReactionBarProps {
  reactions: Reaction[]
  messageId: string
  channelId: string
  currentUserId: string
}

function groupReactions(reactions: Reaction[], userId: string): ReactionGroup[] {
  const map: Record<string, ReactionGroup> = {}
  for (const r of reactions) {
    if (!map[r.emoji]) {
      map[r.emoji] = { emoji: r.emoji, count: 0, userIds: [], reacted: false }
    }
    map[r.emoji].count++
    map[r.emoji].userIds.push(r.user_id)
    if (r.user_id === userId) map[r.emoji].reacted = true
  }
  return Object.values(map)
}

export function ReactionBar({ reactions, messageId, channelId, currentUserId }: ReactionBarProps) {
  const qc = useQueryClient()
  const groups = useMemo(() => groupReactions(reactions, currentUserId), [reactions, currentUserId])

  const handleToggle = async (emoji: string) => {
    await toggleReaction(messageId, currentUserId, emoji)
    qc.invalidateQueries({ queryKey: ['messages', channelId] })
  }

  if (!groups.length) return null

  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {groups.map((g) => (
        <button
          key={g.emoji}
          onClick={() => handleToggle(g.emoji)}
          title={`${g.count} reaction${g.count !== 1 ? 's' : ''}`}
          className={cn(
            'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-all duration-150',
            g.reacted
              ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-300'
              : 'bg-surface-100 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-zinc-600 dark:text-zinc-400 hover:border-primary-300'
          )}
        >
          {g.emoji}
          <span>{g.count}</span>
        </button>
      ))}
    </div>
  )
}
