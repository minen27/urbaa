'use client'

import { useUIStore } from '@/lib/stores/uiStore'
import { useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useUIStore()

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={cn('btn-ghost p-2 rounded-lg', className)}
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
