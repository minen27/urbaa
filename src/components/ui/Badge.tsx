'use client'

import { cn } from '@/lib/utils/cn'

interface BadgeProps {
  count: number
  className?: string
}

export function Badge({ count, className }: BadgeProps) {
  if (count === 0) return null
  return (
    <span className={cn('badge', className)}>
      {count > 99 ? '99+' : count}
    </span>
  )
}

interface StatusBadgeProps {
  status: 'online' | 'away' | 'busy' | 'offline'
  className?: string
}

const statusLabels = { online: 'Online', away: 'Away', busy: 'Do not disturb', offline: 'Offline' }
const statusClass  = { online: 'bg-emerald-400', away: 'bg-amber-400', busy: 'bg-red-400', offline: 'bg-zinc-400' }

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', className)}>
      <span className={cn('w-2 h-2 rounded-full', statusClass[status])} />
      {statusLabels[status]}
    </span>
  )
}
