export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full overflow-auto" style={{ background: 'var(--bg-page)' }}>
      <header className="px-6 py-4 border-b border-[var(--border)] shrink-0 bg-white dark:bg-zinc-950">
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Admin Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Manage your workspace</p>
      </header>
      <main className="flex-1 p-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Welcome Admin</h2>
          <p className="text-zinc-500">Your dashboard is secure and accessible only to you.</p>
        </div>
      </main>
    </div>
  )
}
