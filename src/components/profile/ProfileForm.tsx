'use client'

import { useState, useRef } from 'react'
import { useAuthStore } from '@/lib/stores/authStore'
import { updateProfile } from '@/lib/supabase/users'
import { uploadFile, buildAvatarPath } from '@/lib/supabase/files'
import { toast } from 'sonner'
import { Camera, Shield, Activity, CheckCircle, XCircle, Calendar, Hash, Mail, User, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/user'

const statusColors: Record<string, string> = {
  online: '#22c55e', away: '#f59e0b', busy: '#ef4444', offline: '#71717a',
}
const statusLabels: Record<string, string> = {
  online: 'Online', away: 'Away', busy: 'Do not disturb', offline: 'Offline',
}
const STATUS_OPTIONS = [
  { value: 'online', label: '🟢 Online' },
  { value: 'away', label: '🟡 Away' },
  { value: 'busy', label: '🔴 Do not disturb' },
  { value: 'offline', label: '⚫ Appear offline' },
] as const

function InfoRow({ icon, label, value, mono = false }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; mono?: boolean
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <span className="mt-0.5 text-zinc-400 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">{label}</p>
        <div className={`text-sm font-medium text-zinc-900 dark:text-zinc-100 break-all ${mono ? 'font-mono text-xs bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded-lg' : ''}`}>
          {value}
        </div>
      </div>
    </div>
  )
}

interface Props {
  initialProfile: Profile
  userEmail: string
  userId: string
}

export function ProfileForm({ initialProfile, userEmail, userId }: Props) {
  const { setProfile, logout } = useAuthStore()
  const [profile, setLocalProfile] = useState<Profile>(initialProfile)
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editName, setEditName] = useState(initialProfile.display_name)
  const [editStatus, setEditStatus] = useState(initialProfile.status)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleSave = async () => {
    setSaving(true)
    const updates = { display_name: editName, status: editStatus as Profile['status'] }
    const { error } = await updateProfile(userId, updates)
    setSaving(false)
    if (error) { toast.error('Failed to save'); return }
    const updated = { ...profile, ...updates }
    setLocalProfile(updated)
    setProfile(updated)
    toast.success('Profile updated!')
    setEditing(false)
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const path = buildAvatarPath(userId, file.name)
    const { url, error } = await uploadFile(file, path)
    setUploading(false)
    if (error || !url) { toast.error('Failed to upload avatar'); return }
    await updateProfile(userId, { avatar_url: url })
    const updated = { ...profile, avatar_url: url }
    setLocalProfile(updated)
    setProfile(updated)
    toast.success('Avatar updated!')
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      const supabase = getSupabaseBrowserClient()
      await supabase.auth.signOut()
    } catch {}
    logout()
    window.location.href = '/login'
  }

  const createdAt = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : 'Unknown'

  const initials = profile.display_name?.slice(0, 2).toUpperCase() || '??'

  return (
    <div className="space-y-5">
      {/* Hero banner + avatar */}
      <div className="rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
        <div className="h-24 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />
        <div className="bg-white dark:bg-zinc-900 px-5 pb-5">
          <div className="relative inline-block -mt-10 mb-3">
            <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-zinc-900 overflow-hidden bg-violet-500 flex items-center justify-center shadow-lg text-white text-2xl font-bold">
              {profile.avatar_url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
                : initials
              }
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-violet-500 hover:bg-violet-600 text-white flex items-center justify-center shadow transition-colors"
            >
              {uploading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera size={12} />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{profile.display_name}</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold"
              style={{ background: profile.role === 'admin' ? '#ede9fe' : '#e0f2fe', color: profile.role === 'admin' ? '#7c3aed' : '#0369a1' }}>
              <Shield size={10} />
              {profile.role === 'admin' ? 'Workspace Admin' : 'Standard User'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800"
              style={{ color: statusColors[profile.status] }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColors[profile.status] }} />
              {statusLabels[profile.status] || profile.status}
            </span>
          </div>
        </div>
      </div>

      {/* Account information */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5">
        <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-1">Account Information</h3>
        <InfoRow icon={<Hash size={15} />} label="User ID" value={userId} mono />
        <InfoRow icon={<User size={15} />} label="Display Name" value={profile.display_name} />
        <InfoRow icon={<Mail size={15} />} label="Email Address" value={userEmail} />
        <InfoRow icon={<Shield size={15} />} label="Role" value={
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: profile.role === 'admin' ? '#ede9fe' : '#e0f2fe', color: profile.role === 'admin' ? '#7c3aed' : '#0369a1' }}>
            {profile.role === 'admin' ? 'Workspace Admin' : 'Standard User'}
          </span>
        } />
        <InfoRow icon={<Activity size={15} />} label="Status" value={
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: statusColors[profile.status] }} />
            {statusLabels[profile.status]}
          </span>
        } />
        <InfoRow
          icon={profile.is_active ? <CheckCircle size={15} className="text-emerald-500" /> : <XCircle size={15} className="text-red-500" />}
          label="Account Status"
          value={
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: profile.is_active ? '#f0fdf4' : '#fff1f2', color: profile.is_active ? '#16a34a' : '#dc2626' }}>
              {profile.is_active ? '✓ Active' : '✗ Inactive'}
            </span>
          }
        />
        <InfoRow icon={<Calendar size={15} />} label="Member Since" value={createdAt} />
      </div>

      {/* Edit section */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Edit Profile</h3>
          <button onClick={() => setEditing(!editing)} className="text-xs font-semibold text-violet-500 hover:text-violet-700">
            {editing ? 'Cancel' : 'Edit ✏️'}
          </button>
        </div>
        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Display Name</label>
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-400 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Status</label>
              <select
                value={editStatus}
                onChange={e => setEditStatus(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-violet-400 text-zinc-900 dark:text-zinc-100"
              >
                {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-sm font-bold transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : (
          <p className="text-sm text-zinc-400">Click &quot;Edit&quot; to update your display name and status.</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={() => router.back()}
          className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
          ← Back
        </button>
        <button onClick={handleLogout}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors">
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  )
}
