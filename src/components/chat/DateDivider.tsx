'use client'

import { formatDividerDate } from '@/lib/utils/formatDate'

export function DateDivider({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-3 py-3 px-4">
      <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
      <span className="text-xs font-medium text-zinc-400 shrink-0">
        {formatDividerDate(date)}
      </span>
      <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
    </div>
  )
}
