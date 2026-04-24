'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { adminUpdateRole, adminDeactivateUser } from '@/lib/supabase/users'
import { toast } from 'sonner'
import { Shield, UserX, Loader2 } from 'lucide-react'
import type { Profile } from '@/types/user'

export function UserTable() {
  const qc = useQueryClient()

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await fetch('/api/users')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.data as Profile[]
    },
  })

  const promoteAdmin = useMutation({
    mutationFn: (userId: string) => adminUpdateRole(userId, 'admin'),
    onSuccess: () => { toast.success('User promoted to Admin'); qc.invalidateQueries({ queryKey: ['admin-users'] }) },
    onError: () => toast.error('Failed to update role'),
  })

  const deactivate = useMutation({
    mutationFn: (userId: string) => adminDeactivateUser(userId),
    onSuccess: () => { toast.success('User deactivated'); qc.invalidateQueries({ queryKey: ['admin-users'] }) },
    onError: () => toast.error('Failed to deactivate user'),
  })

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-zinc-400" size={24} /></div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-200 dark:border-surface-700 text-left">
            <th className="pb-3 pr-4 font-medium text-zinc-500">User</th>
            <th className="pb-3 pr-4 font-medium text-zinc-500">Status</th>
            <th className="pb-3 pr-4 font-medium text-zinc-500">Role</th>
            <th className="pb-3 pr-4 font-medium text-zinc-500">Member since</th>
            <th className="pb-3 font-medium text-zinc-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
          {(users ?? []).map((u) => (
            <tr key={u.id} className="group">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                  <Avatar src={u.avatar_url} name={u.display_name} size="sm" />
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{u.display_name}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 pr-4">
                <StatusBadge status={u.status} />
              </td>
              <td className="py-3 pr-4">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  u.role === 'admin'
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}>
                  {u.role}
                </span>
              </td>
              <td className="py-3 pr-4 text-zinc-400">
                {new Date(u.created_at).toLocaleDateString()}
              </td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  {u.role !== 'admin' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => promoteAdmin.mutate(u.id)}
                      loading={promoteAdmin.isPending}
                    >
                      <Shield size={12} /> Make Admin
                    </Button>
                  )}
                  {u.is_active !== false && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => deactivate.mutate(u.id)}
                      loading={deactivate.isPending}
                    >
                      <UserX size={12} /> Deactivate
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
