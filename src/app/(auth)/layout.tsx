import type { Metadata } from 'next'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export const metadata: Metadata = {
  title: 'Sign in — Urba Chat',
  description: 'Sign in to your Urba Chat workspace',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-page)' }}>
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary-400 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Urba Chat</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Centered content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-zinc-400">
        © {new Date().getFullYear()} Urba Chat. All rights reserved.
      </footer>
    </div>
  )
}
