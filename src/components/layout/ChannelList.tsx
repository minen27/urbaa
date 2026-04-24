'use client'

import { Hash, Plus } from 'lucide-react'
import { useChannelStore } from '@/lib/stores/channelStore'
import { useRouter, useParams } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'
import { useState } from 'react'
import { createChannel, joinChannel } from '@/lib/supabase/channels'
import { useAuthStore } from '@/lib/stores/authStore'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface ChannelListProps {
  workspaceId: string
}

export function ChannelList({ workspaceId }: ChannelListProps) {
  const { channels, unreadCounts, activeChannelId, setActiveChannel, addChannel } = useChannelStore()
  const { user, profile } = useAuthStore()
  const router = useRouter()
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)

  const handleSelect = (channelId: string) => {
    setActiveChannel(channelId)
    router.push(`/workspace/${workspaceId}/channel/${channelId}`)
  }

  const handleCreate = async () => {
    if (!name.trim() || !user) return
    setCreating(true)

    try {
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: workspaceId,
          name: name.trim().toLowerCase().replace(/\s+/g, '-'),
          type: 'public',
        }),
      })
      const json = await res.json()
      setCreating(false)

      if (!res.ok) {
        throw new Error(json.error || 'Failed to create channel')
      }

      if (json.data) {
        addChannel(json.data)
        qc.invalidateQueries({ queryKey: ['channels', workspaceId] })
        toast.success(`#${json.data.name} created`)
        setName('')
        setShowModal(false)
        // Automatically navigate to the new channel
        router.push(`/workspace/${workspaceId}/channel/${json.data.id}`)
      }
    } catch (err: any) {
      setCreating(false)
      console.error('CREATE CHANNEL ERROR:', err)
      toast.error(err.message)
      return
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between px-2 mb-1">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Channels</span>
        {profile?.role === 'admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-ghost p-1 rounded"
            aria-label="New channel"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      <div className="space-y-0.5">
        {channels.map((ch) => (
          <button
            key={ch.id}
            onClick={() => handleSelect(ch.id)}
            className={cn('sidebar-item', activeChannelId === ch.id && 'sidebar-item-active')}
          >
            <Hash size={15} className="shrink-0" />
            <span className="flex-1 truncate">{ch.name}</span>
            {(unreadCounts[ch.id] ?? 0) > 0 && (
              <Badge count={unreadCounts[ch.id]} />
            )}
          </button>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create a channel">
        <div className="mt-4 space-y-4">
          <Input
            id="channel-name"
            label="Channel name"
            placeholder="e.g. team-updates"
            value={name}
            onChange={(e) => setName(e.target.value)}
            hint="Lowercase letters, numbers, hyphens only"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={creating}>Create channel</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
