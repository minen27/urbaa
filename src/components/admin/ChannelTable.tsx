'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { deleteChannel } from '@/lib/supabase/channels'
import { fetchChannels } from '@/lib/supabase/channels'
import { toast } from 'sonner'
import { Trash2, Hash, Lock, Loader2 } from 'lucide-react'
import type { Channel } from '@/types/channel'

const WORKSPACE_ID = process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID ?? 'default'

export function ChannelTable() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-channels'],
    queryFn: () => fetchChannels(WORKSPACE_ID),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => fetch(`/api/channels/${id}`, { method: 'DELETE' }).then((r) => r.json()),
    onSuccess: () => { toast.success('Channel deleted'); qc.invalidateQueries({ queryKey: ['admin-channels'] }) },
    onError: () => toast.error('Failed to delete channel'),
  })

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-zinc-400" size={24} /></div>
  }

  const channels = data?.data ?? []

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-200 dark:border-surface-700 text-left">
            <th className="pb-3 pr-4 font-medium text-zinc-500">Channel</th>
            <th className="pb-3 pr-4 font-medium text-zinc-500">Type</th>
            <th className="pb-3 pr-4 font-medium text-zinc-500">Description</th>
            <th className="pb-3 pr-4 font-medium text-zinc-500">Created</th>
            <th className="pb-3 font-medium text-zinc-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
          {channels.map((ch: Channel) => (
            <tr key={ch.id}>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  {ch.type === 'private' ? <Lock size={14} className="text-zinc-400" /> : <Hash size={14} className="text-zinc-400" />}
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{ch.name}</span>
                </div>
              </td>
              <td className="py-3 pr-4">
                <span className="text-xs px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-zinc-500">{ch.type}</span>
              </td>
              <td className="py-3 pr-4 text-zinc-400 max-w-xs truncate">{ch.description ?? '—'}</td>
              <td className="py-3 pr-4 text-zinc-400">{new Date(ch.created_at).toLocaleDateString()}</td>
              <td className="py-3">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => deleteMutation.mutate(ch.id)}
                  loading={deleteMutation.isPending}
                >
                  <Trash2 size={12} /> Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
