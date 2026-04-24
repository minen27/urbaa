'use client'

import { useState, useEffect } from 'react'
import { X, Search, User, Shield, Activity, CheckCircle, XCircle, Calendar, Hash, MessageSquare } from 'lucide-react'
import type { Profile } from '@/types/user'

interface UserDirectoryProps {
  onClose: () => void
}

const statusColors: Record<string, string> = {
  online: '#22c55e', away: '#f59e0b', busy: '#ef4444', offline: '#71717a',
}

export function UserDirectory({ onClose }: UserDirectoryProps) {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        if (data.data) setUsers(data.data)
        setLoading(false)
      })
  }, [])

  const filteredUsers = users.filter(u => 
    u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.id.includes(search)
  )

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
      
      <div style={{
        position: 'relative', width: '100%', maxWidth: 450, height: '80vh',
        background: '#fff', borderRadius: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#18181b' }}>Workspace Members</h2>
            <p style={{ fontSize: 12, color: '#71717a', margin: '2px 0 0' }}>{users.length} users registered</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#f4f4f5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '16px 24px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
            <input 
              placeholder="Search by name or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: 12, border: '1px solid #e4e4e7', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 20px' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#a1a1aa', fontSize: 14 }}>Loading members...</div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#a1a1aa', fontSize: 14 }}>No members found</div>
          ) : (
            filteredUsers.map(user => (
              <button 
                key={user.id}
                onClick={() => setSelectedUser(user)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                  borderRadius: 14, border: 'none', background: 'none', cursor: 'pointer',
                  textAlign: 'left', transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 14, overflow: 'hidden'
                }}>
                  {user.avatar_url ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.display_name?.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#18181b' }}>{user.display_name}</span>
                    {user.role === 'admin' && <Shield size={10} color="#7c3aed" />}
                  </div>
                  <div style={{ fontSize: 11, color: '#71717a', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.id}</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[user.status] || '#71717a' }} />
              </button>
            ))
          )}
        </div>
      </div>

      {/* User Profile View (Overlay) */}
      {selectedUser && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={() => setSelectedUser(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
          <div style={{
            position: 'relative', width: '100%', maxWidth: 350,
            background: '#fff', borderRadius: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            overflow: 'hidden'
          }}>
            {/* Banner */}
            <div style={{ height: 100, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', position: 'relative' }}>
              <button onClick={() => setSelectedUser(null)} style={{
                position: 'absolute', top: 12, right: 12, width: 28, height: 28,
                borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.2)',
                color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <X size={14} />
              </button>
            </div>
            
            <div style={{ padding: '0 24px 24px' }}>
              <div style={{ marginTop: -40, marginBottom: 12 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 20, border: '4px solid #fff',
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: 24, overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  {selectedUser.avatar_url ? <img src={selectedUser.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : selectedUser.display_name?.slice(0, 2).toUpperCase()}
                </div>
              </div>

              <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: '#18181b' }}>{selectedUser.display_name}</h3>
              <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
                <span style={{ padding: '2px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: selectedUser.role === 'admin' ? '#ede9fe' : '#e0f2fe', color: selectedUser.role === 'admin' ? '#7c3aed' : '#0369a1' }}>
                  {selectedUser.role === 'admin' ? '🛡 Admin' : '👤 Member'}
                </span>
                <span style={{ padding: '2px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: '#f4f4f5', color: statusColors[selectedUser.status] || '#71717a' }}>
                  {selectedUser.status.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <button 
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/dm/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ targetUserId: selectedUser.id })
                      })
                      const json = await res.json()
                      if (json.data) {
                        onClose()
                        window.location.href = `/workspace/default/channel/${json.data.id}`
                      }
                    } catch (err) {
                      console.error('Failed to start message')
                    }
                  }}
                  style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', background: '#8b5cf6', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <MessageSquare size={16} />
                  Message
                </button>
                <button 
                  onClick={async () => {
                    const newRole = selectedUser.role === 'admin' ? 'user' : 'admin'
                    const res = await fetch(`/api/profile/${selectedUser.id}/role`, { 
                      method: 'POST', 
                      body: JSON.stringify({ role: newRole }) 
                    })
                    if (res.ok) {
                      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, role: newRole } : u))
                      setSelectedUser({ ...selectedUser, role: newRole })
                    }
                  }}
                  style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1px solid #e4e4e7', background: '#fff', fontSize: 13, fontWeight: 700, color: '#3f3f46', cursor: 'pointer' }}
                >
                  Change to {selectedUser.role === 'admin' ? 'User' : 'Admin'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <InfoItem icon={<Hash size={14} />} label="ID" value={selectedUser.id} mono />
                <InfoItem icon={<Shield size={14} />} label="Role" value={selectedUser.role} />
                <InfoItem icon={<Activity size={14} />} label="Status" value={selectedUser.status} />
                <InfoItem 
                  icon={selectedUser.is_active ? <CheckCircle size={14} color="#22c55e" /> : <XCircle size={14} color="#ef4444" />} 
                  label="Active" value={selectedUser.is_active ? 'Yes' : 'No'} 
                />
                <InfoItem icon={<Calendar size={14} />} label="Joined" value={new Date(selectedUser.created_at).toLocaleDateString()} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoItem({ icon, label, value, mono = false }: { icon: any, label: string, value: string, mono?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div style={{ color: '#a1a1aa', marginTop: 2 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#3f3f46', wordBreak: 'break-all', fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</div>
      </div>
    </div>
  )
}
