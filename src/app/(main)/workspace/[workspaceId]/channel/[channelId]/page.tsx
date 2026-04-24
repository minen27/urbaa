'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MessageList } from '@/components/chat/MessageList'
import { MessageInput } from '@/components/chat/MessageInput'
import { GlobalSearchBar } from '@/components/search/GlobalSearchBar'
import { ChannelMembers } from '@/components/chat/ChannelMembers'
import { useChannelStore } from '@/lib/stores/channelStore'
import { useAuthStore } from '@/lib/stores/authStore'
import { useUIStore } from '@/lib/stores/uiStore'
import { Hash, Users, Menu } from 'lucide-react'
import type { Message } from '@/types/message'
import type { Channel } from '@/types/channel'

export default function ChannelPage() {
  const params = useParams()
  const channelId = params.channelId as string
  const workspaceId = params.workspaceId as string
  
  const { setActiveChannel } = useChannelStore()
  const { toggleSidebar } = useUIStore()
  const [channel, setChannel] = useState<any>(null)
  const [replyTo, setReplyTo] = useState<any>(null)
  const [showMembers, setShowMembers] = useState(false)

  useEffect(() => {
    if (channelId) {
      setActiveChannel(channelId)
      // Fetch channel details immediately to avoid "Loading..."
      fetch(`/api/channels/details?id=${channelId}`)
        .then(res => res.json())
        .then(data => {
          if (data.data) setChannel(data.data)
        })
    }
  }, [channelId, setActiveChannel])

  const { user } = useAuthStore()

  const getChannelTitle = () => {
    if (!channel) return 'Loading...'
    if (channel.type === 'dm' && channel.members) {
      const otherMember = channel.members.find((m: any) => m.user?.id !== user?.id)
      return otherMember?.user?.display_name || 'Direct Message'
    }
    return channel.name
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Channel header */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={toggleSidebar} className="md:hidden p-2 -ml-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100 truncate">
            {channel?.type !== 'dm' && <Hash size={18} className="text-zinc-400 shrink-0" />}
            {getChannelTitle()}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <GlobalSearchBar workspaceId={workspaceId} />
          <button 
            onClick={() => setShowMembers(!showMembers)}
            className={`p-2 rounded-lg transition-colors ${showMembers ? 'bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
          >
            <Users size={18} />
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 min-h-0 relative flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-hidden">
            <MessageList 
              channelId={channelId} 
              onReply={(msg) => setReplyTo(msg)}
            />
          </div>
          <div className="p-4 pt-0">
            <MessageInput
              channelId={channelId}
              replyTo={replyTo}
              onCancelReply={() => setReplyTo(null)}
            />
          </div>
        </div>

        {/* Floating Members Panel */}
        {showMembers && (
          <ChannelMembers 
            channelId={channelId} 
            onClose={() => setShowMembers(false)} 
          />
        )}
      </div>
    </div>
  )
}
