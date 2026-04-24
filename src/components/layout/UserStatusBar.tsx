'use client'

import { useState } from 'react'
import { useAuthStore } from '@/lib/stores/authStore'
import { Shield, Activity, CheckCircle, XCircle, Calendar, Hash, Mail, User, LogOut, X, Edit2, Check } from 'lucide-react'
import { updateProfile } from '@/lib/supabase/users'
import { toast } from 'sonner'
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
]

function InfoRow({ icon, label, value, mono = false }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; mono?: boolean
}) {
  return (
    <div style={{ paddingBottom: 10, borderBottom: '1px solid #f4f4f5', marginBottom: 2 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
        <span style={{ color: '#a1a1aa' }}>{icon}</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
      </div>
      <div style={{ paddingLeft: 18, fontSize: 13, fontWeight: 600, color: '#18181b', wordBreak: 'break-all', ...(mono ? { fontFamily: 'monospace', fontSize: 11, color: '#71717a' } : {}) }}>
        {value}
      </div>
    </div>
  )
}

export function UserStatusBar() {
  const { profile, user, setProfile, logout } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(profile?.display_name || '')
  const [editStatus, setEditStatus] = useState(profile?.status || 'online')
  const [saving, setSaving] = useState(false)

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User'
  const initials = displayName.slice(0, 2).toUpperCase()
  const role = profile?.role || 'user'
  const email = user?.email || ''
  const userId = user?.id || ''
  const createdAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  const openPanel = () => {
    setEditName(profile?.display_name || '')
    setEditStatus(profile?.status || 'online')
    setEditing(false)
    setOpen(true)
  }

  const handleSave = async () => {
    if (!userId) return
    setSaving(true)
    const updates = { display_name: editName, status: editStatus as Profile['status'] }
    const { error } = await updateProfile(userId, updates)
    setSaving(false)
    if (error) { toast.error('Failed to save'); return }
    setProfile({ ...profile!, ...updates })
    toast.success('Profile updated!')
    setEditing(false)
  }

  const handleLogout = () => {
    // Navigate to the server logout endpoint — it clears cookies and redirects to /login
    logout() // clear zustand store immediately
    window.location.href = '/api/auth/logout'
  }

  return (
    <>
      {/* ── Bottom Bar ── */}
      <div style={{
        borderTop: '1px solid #e4e4e7', background: '#fff',
        padding: '10px 12px', display: 'flex', alignItems: 'center',
        gap: 8, flexShrink: 0,
      }}>
        {/* User row → opens profile panel */}
        <button onClick={openPanel} style={{
          display: 'flex', alignItems: 'center', gap: 9,
          flex: 1, minWidth: 0, background: 'none', border: 'none',
          cursor: 'pointer', padding: '4px 6px', borderRadius: 10, textAlign: 'left',
        }} title="View profile">
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0, overflow: 'hidden',
          }}>
            {profile?.avatar_url
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={profile.avatar_url} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#18181b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </div>
            <div style={{ fontSize: 10, color: '#71717a', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
              {role}
            </div>
          </div>
        </button>

        {/* Logout button */}
        <button onClick={handleLogout} title="Sign out" style={{
          width: 30, height: 30, borderRadius: 8, border: '1px solid #fecaca',
          background: '#fff1f2', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', color: '#ef4444', flexShrink: 0,
        }}>
          <LogOut size={14} />
        </button>
      </div>

      {/* ── Profile Panel ── */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start' }}>
          {/* Backdrop */}
          <div onClick={() => setOpen(false)} style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)',
          }} />

          {/* Panel */}
          <div style={{
            position: 'relative', zIndex: 10, width: 300, maxHeight: '88vh',
            background: '#fff', borderRadius: '20px 20px 0 0',
            boxShadow: '0 -12px 48px rgba(0,0,0,0.2)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            {/* Banner */}
            <div style={{ height: 72, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', flexShrink: 0, position: 'relative' }}>
              <button onClick={() => setOpen(false)} style={{
                position: 'absolute', top: 10, right: 10, width: 26, height: 26,
                borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              }}>
                <X size={13} />
              </button>
            </div>

            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 16px' }}>
              {/* Avatar */}
              <div style={{ marginTop: -28, marginBottom: 10 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 13, border: '3px solid #fff',
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: 18,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)', overflow: 'hidden',
                }}>
                  {profile?.avatar_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={profile.avatar_url} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : initials}
                </div>
              </div>

              <h2 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800, color: '#18181b' }}>{profile?.display_name || displayName}</h2>
              <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                <span style={{ padding: '2px 9px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: role === 'admin' ? '#ede9fe' : '#e0f2fe', color: role === 'admin' ? '#7c3aed' : '#0369a1' }}>
                  {role === 'admin' ? '🛡 Admin' : '👤 User'}
                </span>
                <span style={{ padding: '2px 9px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: '#f4f4f5', color: statusColors[profile?.status || 'offline'], display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColors[profile?.status || 'offline'], display: 'inline-block' }} />
                  {statusLabels[profile?.status || 'offline']}
                </span>
              </div>

              {/* Info */}
              <InfoRow icon={<Hash size={11} />} label="User ID" value={userId} mono />
              <InfoRow icon={<User size={11} />} label="Display Name" value={profile?.display_name || displayName} />
              <InfoRow icon={<Mail size={11} />} label="Email" value={email} />
              <InfoRow icon={<Shield size={11} />} label="Role" value={
                <span style={{ padding: '1px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: role === 'admin' ? '#ede9fe' : '#e0f2fe', color: role === 'admin' ? '#7c3aed' : '#0369a1' }}>
                  {role === 'admin' ? 'Workspace Admin' : 'Standard User'}
                </span>
              } />
              <InfoRow icon={<Activity size={11} />} label="Status" value={
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: statusColors[profile?.status || 'offline'], display: 'inline-block' }} />
                  {statusLabels[profile?.status || 'offline']}
                </span>
              } />
              <InfoRow
                icon={profile?.is_active ? <CheckCircle size={11} color="#22c55e" /> : <XCircle size={11} color="#ef4444" />}
                label="Account Status"
                value={
                  <span style={{ padding: '1px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: profile?.is_active ? '#f0fdf4' : '#fff1f2', color: profile?.is_active ? '#16a34a' : '#dc2626' }}>
                    {profile?.is_active ? '✓ Active' : '✗ Inactive'}
                  </span>
                }
              />
              <InfoRow icon={<Calendar size={11} />} label="Member Since" value={createdAt} />

              {/* Inline Edit */}
              {editing && (
                <div style={{ marginTop: 12, padding: 12, background: '#fafafa', borderRadius: 12, border: '1px solid #e4e4e7' }}>
                  <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Edit Profile</p>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#71717a', display: 'block', marginBottom: 4 }}>Display Name</label>
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #d4d4d8', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#71717a', display: 'block', marginBottom: 4 }}>Status</label>
                    <select
                      value={editStatus}
                      onChange={e => setEditStatus(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #d4d4d8', fontSize: 13, outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                    >
                      {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <button onClick={handleSave} disabled={saving} style={{
                    width: '100%', padding: '8px', borderRadius: 9, border: 'none',
                    background: '#8b5cf6', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}>
                    {saving ? 'Saving...' : '✓ Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '10px 18px', borderTop: '1px solid #f4f4f5', display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => setEditing(!editing)}
                style={{
                  flex: 1, padding: '9px', borderRadius: 11,
                  border: '1px solid #e4e4e7', background: editing ? '#fafafa' : '#fff',
                  fontSize: 13, fontWeight: 700, color: '#3f3f46', cursor: 'pointer',
                }}
              >
                {editing ? 'Cancel' : '✏️ Edit Profile'}
              </button>
              <button
                onClick={handleLogout}
                style={{
                  flex: 1, padding: '9px', borderRadius: 11,
                  border: '1px solid #fecaca', background: '#fff1f2',
                  fontSize: 13, fontWeight: 700, color: '#ef4444', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}
              >
                <LogOut size={13} /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
