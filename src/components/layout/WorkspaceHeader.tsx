'use client'

import { Settings, Users } from 'lucide-react'
import { useUIStore } from '@/lib/stores/uiStore'
import { useAuthStore } from '@/lib/stores/authStore'
import Link from 'next/link'

interface WorkspaceHeaderProps {
  workspaceId: string
  workspaceName?: string
  onShowUsers?: () => void
}

export function WorkspaceHeader({ workspaceName = 'My Workspace', onShowUsers }: WorkspaceHeaderProps) {
  const { toggleSidebar } = useUIStore()
  const { profile } = useAuthStore()

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-primary-400 flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
          {workspaceName}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {profile?.role === 'admin' && (
          <button 
            onClick={onShowUsers}
            className="btn-ghost p-1.5 rounded-lg text-zinc-500 hover:text-primary-500" 
            title="Workspace Members"
          >
            <Users size={15} />
          </button>
        )}
        <button className="btn-ghost p-1.5 rounded-lg" aria-label="Workspace settings">
          <Settings size={15} />
        </button>
      </div>
    </div>
  )
}
