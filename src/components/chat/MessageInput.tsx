'use client'

import { useRef, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useAuthStore } from '@/lib/stores/authStore'
import { useMessageStore } from '@/lib/stores/messageStore'
import { sendMessage } from '@/lib/supabase/messages'
import { uploadFile, buildFilePath } from '@/lib/supabase/files'
import { useTypingIndicator } from '@/lib/hooks/useRealtime'
import { TypingIndicator } from './TypingIndicator'
import { Button } from '@/components/ui/Button'
import { Paperclip, Send, X, SmilePlus } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'
import EmojiPicker from 'emoji-picker-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import type { Message } from '@/types/message'
import { Avatar } from '@/components/ui/Avatar'

interface MessageInputProps {
  channelId: string
  replyTo?: Message | null
  onCancelReply?: () => void
}

export function MessageInput({ channelId, replyTo, onCancelReply }: MessageInputProps) {
  const [content, setContent]   = useState('')
  const [sending, setSending]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { user, profile } = useAuthStore()
  const { addOptimistic, confirmMessage, removeOptimistic } = useMessageStore()
  const { typingUsers, onType, onBlur } = useTypingIndicator(
    channelId,
    user?.id ?? '',
    profile?.display_name ?? 'Someone'
  )

  // ── File drop zone ────────────────────────────────────────────────────────
  const onDrop = useCallback(async (files: File[]) => {
    if (!user || !files.length) return
    setUploading(true)
    for (const file of files) {
      const path = buildFilePath(channelId, file.name)
      const { url, error } = await uploadFile(file, path)
      if (error || !url) { toast.error(`Failed to upload ${file.name}`); continue }
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel_id: channelId,
          content: '',
          file_url: url,
          file_type: file.type,
        })
      })
    }
    setUploading(false)
  }, [channelId, user])

  const { getRootProps, getInputProps, isDragActive, open: openFilePicker } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  })

  // ── Send (optimistic) ─────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!content.trim() || !user || sending) return
    const tempId  = `temp-${Date.now()}`
    const trimmed = content.trim()
    setContent('')
    setSending(true)

    const optimistic: Message = {
      id: tempId,
      channel_id: channelId,
      user_id: user.id,
      content: trimmed,
      created_at: new Date().toISOString(),
      updated_at: null,
      deleted_at: null,
      reply_to_id: replyTo?.id ?? null,
      file_url: null,
      file_type: null,
      sender: profile ? { ...profile } : undefined,
      reactions: [],
      reply_to: replyTo ? { id: replyTo.id, content: replyTo.content, sender: replyTo.sender } : null,
      isPending: true,
    }

    addOptimistic(channelId, optimistic)
    onCancelReply?.()

    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel_id: channelId,
        content: trimmed,
        reply_to_id: replyTo?.id ?? null,
      })
    })

    const json = await res.json()

    if (!res.ok || !json.data) {
      removeOptimistic(channelId, tempId)
      toast.error(json.error || 'Failed to send message')
    } else {
      confirmMessage(channelId, tempId, json.data)
    }
    setSending(false)
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const insertEmoji = (emoji: string) => {
    setContent((c) => c + emoji)
    setEmojiOpen(false)
    textareaRef.current?.focus()
  }

  return (
    <div {...getRootProps()} className="relative">
      <input {...getInputProps()} />

      {/* Drag overlay */}
      {isDragActive && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-primary-400/10 border-2 border-dashed border-primary-400">
          <p className="text-sm font-medium text-primary-500">Drop files to upload</p>
        </div>
      )}

      {/* Reply banner */}
      {replyTo && (
        <div className="flex items-center gap-2 px-4 py-2 text-xs text-zinc-500 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800">
          <span>Replying to <strong>{replyTo.sender?.display_name}</strong>:</span>
          <span className="flex-1 truncate">{replyTo.content.slice(0, 80)}</span>
          <button onClick={onCancelReply} className="btn-ghost p-1 rounded">
            <X size={12} />
          </button>
        </div>
      )}

      {/* Typing indicator */}
      <TypingIndicator users={typingUsers} />

      {/* Input bar */}
      <div className={cn(
        'flex items-end gap-2 px-4 py-3 border-t border-surface-200 dark:border-surface-700',
        'bg-[var(--bg-page)]'
      )}>
        {/* Toolbar left */}
        <button
          onClick={openFilePicker}
          disabled={uploading}
          title="Attach file"
          className="btn-ghost p-2 rounded-xl shrink-0"
        >
          <Paperclip size={16} className={uploading ? 'animate-pulse text-primary-400' : ''} />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => { setContent(e.target.value); onType() }}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
          placeholder="Send a message…"
          rows={1}
          className={cn(
            'flex-1 input-base py-2.5 text-sm resize-none leading-relaxed',
            'min-h-[42px] max-h-48 overflow-y-auto',
          )}
          style={{ height: 'auto' }}
          onInput={(e) => {
            const t = e.currentTarget
            t.style.height = 'auto'
            t.style.height = `${Math.min(t.scrollHeight, 192)}px`
          }}
        />

        {/* Emoji */}
        <Popover.Root open={emojiOpen} onOpenChange={setEmojiOpen}>
          <Popover.Trigger asChild>
            <button title="Emoji" className="btn-ghost p-2 rounded-xl shrink-0">
              <SmilePlus size={16} />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content side="top" align="end" className="z-50">
              <EmojiPicker onEmojiClick={(e) => insertEmoji(e.emoji)} height={380} />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {/* Send */}
        <Button
          onClick={handleSend}
          disabled={!content.trim() || sending}
          size="sm"
          className="shrink-0 rounded-xl"
          aria-label="Send message"
        >
          <Send size={14} />
        </Button>
      </div>
    </div>
  )
}
