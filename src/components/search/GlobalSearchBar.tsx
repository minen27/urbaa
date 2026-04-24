'use client'

import { useState } from 'react'
import { useSearch } from '@/lib/hooks/useSearch'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Hash, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Avatar } from '@/components/ui/Avatar'
import { formatMessageTime } from '@/lib/utils/formatDate'
import { cn } from '@/lib/utils/cn'

interface GlobalSearchBarProps {
  workspaceId: string
}

export function GlobalSearchBar({ workspaceId }: GlobalSearchBarProps) {
  const [query, setQuery]   = useState('')
  const [focused, setFocused] = useState(false)
  const { messages, channels, users, isLoading, hasResults } = useSearch(query, workspaceId)
  const router = useRouter()

  const hasAny = messages.length > 0 || channels.length > 0 || users.length > 0
  const showDropdown = focused && hasResults && hasAny

  return (
    <div className="relative w-72">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Search messages…"
          className="input-base pl-9 py-2 text-sm"
        />
        {isLoading && query.length > 2 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-primary-400 border-t-transparent animate-spin" />
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 w-full min-w-[24rem] card shadow-card overflow-hidden z-50 max-h-96 overflow-y-auto"
          >
            {/* Messages */}
            {messages.length > 0 && (
              <div>
                <p className="px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wide border-b border-surface-100 dark:border-surface-700">Messages</p>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {messages.slice(0, 5).map((msg: any) => (
                  <button
                    key={msg.id}
                    onClick={() => {
                      router.push(`/workspace/${workspaceId}/channel/${msg.channel?.id}`)
                      setQuery('')
                    }}
                    className="w-full flex flex-col px-3 py-2.5 hover:bg-surface-50 dark:hover:bg-surface-700 text-left border-b border-surface-100 dark:border-surface-800 last:border-0"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Hash size={11} className="text-zinc-400" />
                      <span className="text-xs font-medium text-primary-500">{msg.channel?.name}</span>
                      <span className="text-xs text-zinc-400">{msg.sender?.display_name}</span>
                      <span className="text-xs text-zinc-300 dark:text-zinc-600 ml-auto">{formatMessageTime(msg.created_at)}</span>
                    </div>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 truncate">{msg.content}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Channels */}
            {channels.length > 0 && (
              <div>
                <p className="px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wide border-b border-surface-100 dark:border-surface-700">Channels</p>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {channels.slice(0, 3).map((ch: any) => (
                  <button
                    key={ch.id}
                    onClick={() => { router.push(`/workspace/${workspaceId}/channel/${ch.id}`); setQuery('') }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-surface-50 dark:hover:bg-surface-700 text-left border-b border-surface-100 dark:border-surface-800 last:border-0"
                  >
                    <Hash size={14} className="text-zinc-400" />
                    <span className="text-sm text-zinc-800 dark:text-zinc-200">{ch.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Users */}
            {users.length > 0 && (
              <div>
                <p className="px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wide border-b border-surface-100 dark:border-surface-700">People</p>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {users.slice(0, 3).map((u: any) => (
                  <button
                    key={u.id}
                    className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-surface-50 dark:hover:bg-surface-700 text-left"
                  >
                    <Avatar src={u.avatar_url} name={u.display_name} size="xs" status={u.status} />
                    <span className="text-sm text-zinc-800 dark:text-zinc-200">{u.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
