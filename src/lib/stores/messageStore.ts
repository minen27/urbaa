'use client'

import { create } from 'zustand'
import type { Message } from '@/types/message'

interface MessageState {
  messagesByChannel: Record<string, Message[]>

  setMessages: (channelId: string, msgs: Message[]) => void
  prependMessages: (channelId: string, msgs: Message[]) => void
  addOptimistic: (channelId: string, msg: Message) => void
  confirmMessage: (channelId: string, tempId: string, confirmed: Message) => void
  removeOptimistic: (channelId: string, tempId: string) => void
  upsertMessage: (channelId: string, msg: Message) => void
  deleteMessage: (channelId: string, id: string) => void
  clearChannel: (channelId: string) => void
}

export const useMessageStore = create<MessageState>((set) => ({
  messagesByChannel: {},

  setMessages: (channelId, msgs) =>
    set((s) => ({
      messagesByChannel: { ...s.messagesByChannel, [channelId]: msgs },
    })),

  prependMessages: (channelId, msgs) =>
    set((s) => ({
      messagesByChannel: {
        ...s.messagesByChannel,
        [channelId]: [...msgs, ...(s.messagesByChannel[channelId] ?? [])],
      },
    })),

  addOptimistic: (channelId, msg) =>
    set((s) => ({
      messagesByChannel: {
        ...s.messagesByChannel,
        [channelId]: [...(s.messagesByChannel[channelId] ?? []), msg],
      },
    })),

  confirmMessage: (channelId, tempId, confirmed) =>
    set((s) => ({
      messagesByChannel: {
        ...s.messagesByChannel,
        [channelId]:
          s.messagesByChannel[channelId]?.map((m) =>
            m.id === tempId ? confirmed : m
          ) ?? [],
      },
    })),

  removeOptimistic: (channelId, tempId) =>
    set((s) => ({
      messagesByChannel: {
        ...s.messagesByChannel,
        [channelId]:
          s.messagesByChannel[channelId]?.filter((m) => m.id !== tempId) ?? [],
      },
    })),

  upsertMessage: (channelId, msg) =>
    set((s) => {
      const existing = s.messagesByChannel[channelId] ?? []
      const idx = existing.findIndex((m) => m.id === msg.id)
      const updated =
        idx >= 0
          ? existing.map((m, i) => (i === idx ? { ...m, ...msg } : m))
          : [...existing, msg]
      return { messagesByChannel: { ...s.messagesByChannel, [channelId]: updated } }
    }),

  deleteMessage: (channelId, id) =>
    set((s) => ({
      messagesByChannel: {
        ...s.messagesByChannel,
        [channelId]:
          s.messagesByChannel[channelId]?.map((m) =>
            m.id === id ? { ...m, is_deleted: true, content: 'This message was deleted' } : m
          ) ?? [],
      },
    })),

  clearChannel: (channelId) =>
    set((s) => {
      const next = { ...s.messagesByChannel }
      delete next[channelId]
      return { messagesByChannel: next }
    }),
}))
