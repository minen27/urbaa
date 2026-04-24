'use client'

import { useChannelStore } from '@/lib/stores/channelStore'
import { useAuthStore } from '@/lib/stores/authStore'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { fetchAllUsers } from '@/lib/supabase/users'
import { getOrCreateDMChannel } from '@/lib/supabase/channels'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import type { Profile } from '@/types/user'

interface DMListProps {
  userId: string
}

export function DMList({ userId }: DMListProps) {
  const { dmChannels, unreadCounts, activeChannelId, setActiveChannel } = useChannelStore()
  const router = useRouter()
  const qc = useQueryClient()
  
  const [showModal, setShowModal] = useState(false)
  const [users, setUsers] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    if (showModal) {
      fetchAllUsers().then(({ data }) => setUsers(data.filter(u => u.id !== userId)))
    }
  }, [showModal, userId])

  const handleSelect = (channelId: string) => {
    setActiveChannel(channelId)
    router.push(`/workspace/default/channel/${channelId}`)
  }

  const startDM = async (otherUserId: string) => {
    setStarting(true)
    try {
      const res = await fetch('/api/dm/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: otherUserId })
      })
      const json = await res.json()
      setStarting(false)
      if (json.data) {
        setShowModal(false)
        qc.invalidateQueries({ queryKey: ['dm-channels', userId] })
        handleSelect(json.data.id)
      } else {
        toast.error(json.error || 'Failed to create DM')
      }
    } catch (err) {
      setStarting(false)
      toast.error('Something went wrong')
    }
  }

  const getDMUser = (channel: any) => {
    return channel.all_members?.find((m: any) => m.user?.id !== userId)?.user
  }

  const filteredUsers = users.filter(u => 
    u.display_name.toLowerCase().includes(search.toLowerCase())
  )

  if (!dmChannels.length && !showModal) {
    return (
      <div className="px-2 mb-1 flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Direct Messages
        </span>
        <button
          onClick={() => setShowModal(true)}
          className="btn-ghost p-1 rounded"
          aria-label="New DM"
        >
          <Plus size={14} />
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between px-2 mb-1">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Direct Messages
        </span>
        <button
          onClick={() => setShowModal(true)}
          className="btn-ghost p-1 rounded"
          aria-label="New DM"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="space-y-0.5">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {dmChannels.map((ch: any) => {
          const otherUser = getDMUser(ch)
          if (!otherUser) return null
          const isActive = activeChannelId === ch.id

          return (
            <button
              key={ch.id}
              onClick={() => handleSelect(ch.id)}
              className={cn('sidebar-item', isActive && 'sidebar-item-active')}
            >
              <Avatar
                src={otherUser.avatar_url}
                name={otherUser.display_name}
                size="xs"
                status={otherUser.status}
              />
              <span className="flex-1 truncate text-sm">{otherUser.display_name}</span>
              {(unreadCounts[ch.id] ?? 0) > 0 && (
                <Badge count={unreadCounts[ch.id]} />
              )}
            </button>
          )
        })}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New message">
        <div className="mt-4 space-y-4">
          <Input
            id="user-search"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-60 overflow-y-auto space-y-1">
            {filteredUsers.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-4">No users found</p>
            ) : (
              filteredUsers.map(u => (
                <button
                  key={u.id}
                  onClick={() => startDM(u.id)}
                  disabled={starting}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-left"
                >
                  <Avatar src={u.avatar_url} name={u.display_name} size="sm" status={u.status} />
                  <span className="flex-1 font-medium text-sm text-zinc-900 dark:text-zinc-100">{u.display_name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
