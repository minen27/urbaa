'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Shield, User, Trash2, ChevronDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { ChannelMemberRole } from '@/types/channel'
import type { Profile } from '@/types/user'

interface MemberRow {
  channel_id: string
  user_id: string
  role: ChannelMemberRole
  joined_at: string
  profiles: Profile
}

interface MemberRolePanelProps {
  channelId: string
  /** The current user's role in this channel, or 'admin' if global admin */
  callerRole: ChannelMemberRole | 'admin'
  currentUserId: string
}

const ROLE_META: Record<ChannelMemberRole, { label: string; color: string; Icon: React.ElementType }> = {
  leader:    { label: 'Leader',    color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300', Icon: Crown },
  moderator: { label: 'Moderator', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',     Icon: Shield },
  member:    { label: 'Member',    color: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',         Icon: User },
}

function RoleBadge({ role }: { role: ChannelMemberRole }) {
  const { label, color, Icon } = ROLE_META[role]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon size={10} />
      {label}
    </span>
  )
}

export function MemberRolePanel({ channelId, callerRole, currentUserId }: MemberRolePanelProps) {
  const [members, setMembers] = useState<MemberRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [changingId, setChangingId] = useState<string | null>(null)

  const canManage = callerRole === 'admin' || callerRole === 'leader'

  const fetchMembers = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/channels/${channelId}/members`)
      const json = await res.json()
      if (res.ok) setMembers(json.data ?? [])
      else toast.error(json.error ?? 'Failed to load members')
    } catch {
      toast.error('Network error loading members')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [channelId])

  const changeRole = async (userId: string, newRole: ChannelMemberRole) => {
    setChangingId(userId)
    try {
      const res = await fetch(`/api/channels/${channelId}/members/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error ?? 'Failed to update role'); return }
      toast.success('Role updated')
      setMembers((prev) =>
        prev.map((m) => m.user_id === userId ? { ...m, role: newRole } : m)
      )
    } catch {
      toast.error('Network error')
    } finally {
      setChangingId(null)
    }
  }

  const removeMember = async (userId: string, name: string) => {
    if (!confirm(`Remove ${name} from this channel?`)) return
    try {
      const res = await fetch(`/api/channels/${channelId}/members/${userId}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error ?? 'Failed to remove member'); return }
      toast.success(`${name} removed from channel`)
      setMembers((prev) => prev.filter((m) => m.user_id !== userId))
    } catch {
      toast.error('Network error')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 size={20} className="animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
        Members · {members.length}
      </p>

      <AnimatePresence initial={false}>
        {members.map((member) => {
          const { profiles: profile } = member
          const isSelf = member.user_id === currentUserId
          const isChanging = changingId === member.user_id

          return (
            <motion.div
              key={member.user_id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-700/50 group"
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-violet-600 dark:text-violet-300 text-sm font-semibold">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name + role badge */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                  {profile.display_name}
                  {isSelf && <span className="ml-1.5 text-xs text-zinc-400">(you)</span>}
                </p>
                <RoleBadge role={member.role} />
              </div>

              {/* Controls — visible on hover for managers */}
              {canManage && !isSelf && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Role dropdown */}
                  <div className="relative">
                    <select
                      value={member.role}
                      disabled={isChanging}
                      onChange={(e) => changeRole(member.user_id, e.target.value as ChannelMemberRole)}
                      className="appearance-none pl-2 pr-6 py-1 rounded-lg text-xs border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-violet-400"
                    >
                      <option value="member">Member</option>
                      <option value="moderator">Moderator</option>
                      <option value="leader">Leader</option>
                    </select>
                    <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    {isChanging && (
                      <Loader2 size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 animate-spin text-violet-500 pointer-events-none" />
                    )}
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeMember(member.user_id, profile.display_name)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Remove member"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
