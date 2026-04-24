'use client'

import { useState } from 'react'
import { useChannels, useDMChannels } from '@/lib/hooks/useChannels'
import { useAuthStore } from '@/lib/stores/authStore'
import { useUIStore } from '@/lib/stores/uiStore'
import { ChannelList } from './ChannelList'
import { DMList } from './DMList'
import { UserStatusBar } from './UserStatusBar'
import { WorkspaceHeader } from './WorkspaceHeader'
import { UserDirectory } from '../admin/UserDirectory'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

const WORKSPACE_ID = process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID ?? 'default'

export function Sidebar() {
  const { sidebarOpen } = useUIStore()
  const { user, profile } = useAuthStore()
  const [showUsers, setShowUsers] = useState(false)

  useChannels(WORKSPACE_ID)
  useDMChannels(user?.id ?? '')

  return (
    <AnimatePresence initial={false}>
      {sidebarOpen && (
        <motion.aside
          key="sidebar"
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -280, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn(
            'w-64 flex flex-col shrink-0',
            'border-r border-[var(--border)]',
          )}
          style={{ background: 'var(--bg-sidebar)', height: '100dvh' }}
        >
          <WorkspaceHeader 
            workspaceId={WORKSPACE_ID} 
            onShowUsers={() => setShowUsers(true)} 
          />

          <div className="flex-1 overflow-y-auto py-2 space-y-4 px-2" style={{ minHeight: 0 }}>
            {profile?.role === 'admin' && <ChannelList workspaceId={WORKSPACE_ID} />}
            <DMList userId={user?.id ?? ''} />
          </div>

          <div className="shrink-0">
            <UserStatusBar />
          </div>

          {showUsers && <UserDirectory onClose={() => setShowUsers(false)} />}
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
