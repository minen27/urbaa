'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser, Profile } from '@/types/user'
import type { ChannelMemberRole } from '@/types/channel'

interface AuthState {
  user: AuthUser | null
  profile: Profile | null
  isLoading: boolean
  /** Per-channel role for the currently authenticated user: channelId → role */
  channelRoles: Record<string, ChannelMemberRole>
  setUser: (user: AuthUser | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (v: boolean) => void
  setChannelRole: (channelId: string, role: ChannelMemberRole) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isLoading: true,
      channelRoles: {},
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      setChannelRole: (channelId, role) =>
        set((s) => ({ channelRoles: { ...s.channelRoles, [channelId]: role } })),
      logout: () => set({ user: null, profile: null, channelRoles: {} }),
    }),
    {
      name: 'auth-store',
      partialize: (s) => ({ user: s.user, profile: s.profile }),
    }
  )
)
