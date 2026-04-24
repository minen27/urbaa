'use client'

import { create } from 'zustand'
import type { Channel } from '@/types/channel'

interface ChannelState {
  channels: Channel[]
  dmChannels: Channel[]
  activeChannelId: string | null
  unreadCounts: Record<string, number>
  workspaceId: string | null

  setChannels: (channels: Channel[]) => void
  setDMChannels: (channels: Channel[]) => void
  setActiveChannel: (id: string | null) => void
  setWorkspaceId: (id: string) => void
  incrementUnread: (channelId: string) => void
  clearUnread: (channelId: string) => void
  addChannel: (channel: Channel) => void
  removeChannel: (channelId: string) => void
}

export const useChannelStore = create<ChannelState>((set) => ({
  channels: [],
  dmChannels: [],
  activeChannelId: null,
  unreadCounts: {},
  workspaceId: null,

  setChannels: (channels) => set({ channels }),
  setDMChannels: (dmChannels) => set({ dmChannels }),
  setActiveChannel: (id) => set({ activeChannelId: id }),
  setWorkspaceId: (workspaceId) => set({ workspaceId }),

  incrementUnread: (channelId) =>
    set((s) => ({
      unreadCounts: {
        ...s.unreadCounts,
        [channelId]: (s.unreadCounts[channelId] ?? 0) + 1,
      },
    })),

  clearUnread: (channelId) =>
    set((s) => ({
      unreadCounts: { ...s.unreadCounts, [channelId]: 0 },
    })),

  addChannel: (channel) =>
    set((s) => ({ channels: [...s.channels, channel] })),

  removeChannel: (channelId) =>
    set((s) => ({ channels: s.channels.filter((c) => c.id !== channelId) })),
}))
