'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { TypingUser } from '@/types/message'

export function TypingIndicator({ users }: { users: TypingUser[] }) {
  if (!users.length) return <div className="h-5" />

  const names = users.map((u) => u.displayName)
  const label = names.length === 1
    ? `${names[0]} is typing`
    : names.length === 2
      ? `${names[0]} and ${names[1]} are typing`
      : `${names[0]} and ${names.length - 1} others are typing`

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="h-5 flex items-center gap-2 px-4"
      >
        {/* Bouncing dots */}
        <div className="flex gap-0.5 items-center">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary-400 inline-block animate-bounce"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
            />
          ))}
        </div>
        <span className="text-xs text-zinc-400">{label}</span>
      </motion.div>
    </AnimatePresence>
  )
}
