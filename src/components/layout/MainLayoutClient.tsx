'use client'

import { useEffect } from 'react'
import { useUIStore } from '@/lib/stores/uiStore'
import { useAuth } from '@/lib/hooks/useAuth'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Sidebar } from '@/components/layout/Sidebar'
import { cn } from '@/lib/utils/cn'

export function MainLayoutClient({ children }: { children: React.ReactNode }) {
  const { theme, sidebarOpen } = useUIStore()
  const { user } = useAuth()

  // Apply theme class on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="flex overflow-hidden" style={{ height: '100dvh' }}>
      <Sidebar />
      <div className={cn('flex-1 flex flex-col overflow-hidden transition-all duration-200')}>
        {children}
      </div>
    </div>
  )
}
