'use client'

import { cn } from '@/lib/utils/cn'
import Image from 'next/image'

interface AvatarProps {
  src?: string | null
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  status?: 'online' | 'away' | 'busy' | 'offline'
}

const sizes = {
  xs: { box: 'w-5 h-5',   text: 'text-[9px]',  dot: 'w-1.5 h-1.5' },
  sm: { box: 'w-7 h-7',   text: 'text-[11px]', dot: 'w-2 h-2' },
  md: { box: 'w-9 h-9',   text: 'text-sm',     dot: 'w-2.5 h-2.5' },
  lg: { box: 'w-12 h-12', text: 'text-base',   dot: 'w-3 h-3' },
  xl: { box: 'w-16 h-16', text: 'text-xl',     dot: 'w-3.5 h-3.5' },
}

const statusColors = {
  online:  'bg-emerald-400',
  away:    'bg-amber-400',
  busy:    'bg-red-400',
  offline: 'bg-zinc-400',
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

function stringToColor(str: string) {
  const colors = [
    'bg-violet-400', 'bg-indigo-400', 'bg-sky-400', 'bg-teal-400',
    'bg-emerald-400', 'bg-amber-400', 'bg-rose-400', 'bg-pink-400',
  ]
  let hash = 0
  for (const c of str) hash = c.charCodeAt(0) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export function Avatar({ src, name = '', size = 'md', className, status }: AvatarProps) {
  const { box, text, dot } = sizes[size]
  const initials = getInitials(name || '?')
  const bgColor  = stringToColor(name || '?')

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <div className={cn('rounded-full overflow-hidden flex items-center justify-center', box)}>
        {src ? (
          <Image src={src} alt={name} width={64} height={64} className="w-full h-full object-cover" />
        ) : (
          <div className={cn('w-full h-full flex items-center justify-center text-white font-semibold', bgColor, text)}>
            {initials}
          </div>
        )}
      </div>
      {status && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-[var(--bg-sidebar)]',
            dot, statusColors[status]
          )}
        />
      )}
    </div>
  )
}
