'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface UIState {
  sidebarOpen: boolean
  theme: Theme
  rightPanelOpen: boolean
  activeThreadMessageId: string | null

  toggleSidebar: () => void
  setSidebarOpen: (v: boolean) => void
  setTheme: (t: Theme) => void
  toggleTheme: () => void
  toggleRightPanel: () => void
  setActiveThread: (messageId: string | null) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'light',
      rightPanelOpen: false,
      activeThreadMessageId: null,

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (v) => set({ sidebarOpen: v }),

      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),

      toggleRightPanel: () =>
        set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),

      setActiveThread: (messageId) =>
        set({ activeThreadMessageId: messageId, rightPanelOpen: messageId !== null }),
    }),
    {
      name: 'ui-store',
      partialize: (s) => ({ theme: s.theme, sidebarOpen: s.sidebarOpen }),
    }
  )
)
