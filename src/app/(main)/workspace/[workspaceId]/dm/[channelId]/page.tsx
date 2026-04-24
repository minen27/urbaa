'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MessageList } from '@/components/chat/MessageList'
import { MessageInput } from '@/components/chat/MessageInput'
import { useChannelStore } from '@/lib/stores/channelStore'
import { fetchChannelById, fetchChannelMembers } from '@/lib/supabase/channels'
import { useAuthStore } from '@/lib/stores/authStore'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/Badge'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Channel } from '@/types/channel'
import type { Message } from '@/types/message'
import type { Profile } from '@/types/user'

export default function DMPage() {
  const params = useParams<{ workspaceId: string; channelId: string }>()
  const { channelId, workspaceId } = params
  const { setActiveChannel } = useChannelStore()
  const { user } = useAuthStore()
  const router = useRouter()

  const [channel, setChannel] = useState<Channel | null>(null)
  const [otherUser, setOtherUser] = useState<Profile | null>(null)
  const [replyTo, setReplyTo] = useState<Message | null>(null)

  useEffect(() => {
    setActiveChannel(channelId)

    fetchChannelById(channelId).then(({ data }) => setChannel(data))

    fetchChannelMembers(channelId).then(({ data }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const other = (data as any[])?.find((m) => m.user?.id !== user?.id)?.user
      if (other) setOtherUser(other as Profile)
    })
  }, [channelId, setActiveChannel, user?.id])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* DM header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] shrink-0" style={{ background: 'var(--bg-page)' }}>
        <button onClick={() => router.back()} className="btn-ghost p-2 rounded-lg">
          <ArrowLeft size={16} />
        </button>

        {otherUser ? (
          <>
            <Avatar
              src={otherUser.avatar_url}
              name={otherUser.display_name}
              size="sm"
              status={otherUser.status}
            />
            <div>
              <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {otherUser.display_name}
              </h1>
              <StatusBadge status={otherUser.status} />
            </div>
          </>
        ) : (
          <div className="text-sm text-zinc-400">Loading…</div>
        )}
      </header>

      <MessageList channelId={channelId} onReply={(msg) => setReplyTo(msg)} />
      <MessageInput channelId={channelId} replyTo={replyTo} onCancelReply={() => setReplyTo(null)} />
    </div>
  )
}
