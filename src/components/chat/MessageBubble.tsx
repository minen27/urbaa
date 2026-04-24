'use client'

import { Avatar } from '@/components/ui/Avatar'
import { ReactionBar } from './ReactionBar'
import { FilePreview } from './FilePreview'
import { cn } from '@/lib/utils/cn'
import { formatMessageTime, formatFullDate } from '@/lib/utils/formatDate'
import { useAuthStore } from '@/lib/stores/authStore'
import { editMessage, softDeleteMessage } from '@/lib/supabase/messages'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useState, useRef } from 'react'
import { Pencil, Trash2, Reply, Smile, MoreHorizontal } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type { Message } from '@/types/message'

interface MessageBubbleProps {
  message: Message
  channelId: string
  onReply?: (msg: Message) => void
}

export function MessageBubble({ message, channelId, onReply }: MessageBubbleProps) {
  const { user, profile } = useAuthStore()
  const qc = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const editRef = useRef<HTMLTextAreaElement>(null)

  const isOwn    = user?.id === message.user_id
  const isAdmin  = profile?.role === 'admin'
  const isDeleted = !!message.deleted_at
  const sender   = message.sender

  const handleEdit = async () => {
    if (!editContent.trim()) return
    const { error } = await editMessage(message.id, editContent.trim())
    if (error) { toast.error('Failed to edit message'); return }
    setIsEditing(false)
    qc.invalidateQueries({ queryKey: ['messages', channelId] })
  }

  const handleDelete = async () => {
    const { error } = await softDeleteMessage(message.id)
    if (error) { toast.error('Failed to delete message'); return }
    toast.success('Message deleted')
    qc.invalidateQueries({ queryKey: ['messages', channelId] })
  }

  if (isDeleted) {
    return (
      <div className="px-4 py-1">
        <p className="text-sm italic text-zinc-400">This message was deleted.</p>
      </div>
    )
  }

  return (
    <div className={cn('message-row group relative flex gap-3 px-4 py-1 hover:bg-surface-50 dark:hover:bg-surface-800/50 rounded-lg transition-colors', message.isPending && 'opacity-60')}>
      {/* Hover action bar */}
      <div className="message-hover-actions">
        <button title="React" className="btn-ghost p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          <Smile size={14} />
        </button>
        {onReply && (
          <button title="Reply" onClick={() => onReply(message)} className="btn-ghost p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
            <Reply size={14} />
          </button>
        )}
        {(isOwn || isAdmin) && (
          <>
            {isOwn && (
              <button title="Edit" onClick={() => { setIsEditing(true); setEditContent(message.content); setTimeout(() => editRef.current?.focus(), 50) }} className="btn-ghost p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
                <Pencil size={14} />
              </button>
            )}
            <button title="Delete" onClick={handleDelete} className="btn-ghost p-1.5 rounded-lg text-red-400 hover:text-red-600">
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>

      {/* Avatar */}
      <Avatar src={sender?.avatar_url} name={sender?.display_name ?? 'User'} size="sm" className="mt-0.5 shrink-0" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {sender?.display_name ?? 'Unknown'}
          </span>
          <span title={formatFullDate(message.created_at)} className="text-xs text-zinc-400 cursor-default">
            {formatMessageTime(message.created_at)}
          </span>
          {message.updated_at && (
            <span className="text-xs text-zinc-400 italic">(edited)</span>
          )}
        </div>

        {/* Reply-to snippet */}
        {message.reply_to && (
          <div className="flex items-center gap-2 mb-1 pl-2 border-l-2 border-primary-300 text-xs text-zinc-500">
            <span className="font-medium">{message.reply_to.sender?.display_name}</span>
            <span className="truncate">{message.reply_to.content.slice(0, 80)}</span>
          </div>
        )}

        {/* Body — editing vs display */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              ref={editRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEdit() }
                if (e.key === 'Escape') setIsEditing(false)
              }}
              rows={2}
              className="input-base text-sm resize-none"
            />
            <div className="flex gap-2 text-xs">
              <button onClick={handleEdit} className="btn-primary text-xs px-3 py-1">Save</button>
              <button onClick={() => setIsEditing(false)} className="btn-ghost text-xs px-3 py-1">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            {message.content && (
              <p className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap break-words leading-relaxed">
                {message.content}
              </p>
            )}
            {message.file_url && (
              <FilePreview url={message.file_url} fileType={message.file_type ?? ''} />
            )}
          </>
        )}

        {/* Reactions */}
        {(message.reactions?.length ?? 0) > 0 && (
          <ReactionBar
            reactions={message.reactions ?? []}
            messageId={message.id}
            channelId={channelId}
            currentUserId={user?.id ?? ''}
          />
        )}
      </div>
    </div>
  )
}
