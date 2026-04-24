'use client'

import { useState, useEffect } from 'react'
import { X, Shield, Plus, Search, MessageSquare, UserCircle } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/authStore'
import { toast } from 'sonner'
import type { Profile } from '@/types/user'
import { useParams, useRouter } from 'next/navigation'

interface ChannelMembersProps {
  channelId: string
  onClose: () => void
}

const statusColors: Record<string, string> = {
  online: '#22c55e', away: '#f59e0b', busy: '#ef4444', offline: '#71717a',
}

export function ChannelMembers({ channelId, onClose }: ChannelMembersProps) {
  const { profile: myProfile, channelRoles } = useAuthStore()
  const [members, setMembers] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [viewProfileId, setViewProfileId] = useState<string | null>(null)

  const params = useParams()
  const router = useRouter()
  const workspaceId = params?.workspaceId as string

  const myChannelRole = channelRoles[channelId]
  const canManage = myProfile?.role === 'admin' || myChannelRole === 'leader'

  const fetchMembers = () => {
    if (!channelId) return
    fetch(`/api/channels/${channelId}/members`)
      .then(res => res.json())
      .then(data => {
        if (data.data) setMembers(data.data)
        setLoading(false)
      })
  }

  const fetchAllUsers = () => {
    if (!canManage) return
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        if (data.data) setAllUsers(data.data)
      })
  }

  useEffect(() => {
    fetchMembers()
    fetchAllUsers()
  }, [channelId, myProfile, myChannelRole])

  const handleAddMember = async (userId: string) => {
    if (!channelId) return
    const res = await fetch(`/api/channels/${channelId}/members/add`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    })
    if (res.ok) {
      toast.success('Member added!')
      fetchMembers()
    } else {
      const data = await res.json()
      toast.error(data.error || 'Failed to add member')
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!channelId) return
    if (!confirm('Remove this member?')) return

    const res = await fetch(`/api/channels/${channelId}/members/${userId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      toast.success('Member removed')
      fetchMembers()
    } else {
      toast.error('Failed to remove member')
    }
  }

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/channels/${channelId}/members/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })
      if (res.ok) {
        toast.success('Role updated')
        fetchMembers()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update role')
      }
    } catch {
      toast.error('Network error')
    }
  }

  const handleMessage = (userId: string) => {
    onClose()
    router.push(`/workspace/${workspaceId}/dm/${userId}`)
  }

  const nonMembers = allUsers.filter(u => !members.find(m => m.id === u.id))
  const filteredNonMembers = nonMembers.filter(u => u.display_name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      <div style={{ position: 'absolute', top: 60, right: 16, zIndex: 100, width: 320, maxHeight: 'calc(100vh - 120px)', background: '#fff', borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.15)', border: '1px solid #f4f4f5', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, margin: 0, color: '#18181b' }}>Channel Members</h3>
          <div style={{ display: 'flex', gap: 4 }}>
            {canManage && (
              <button 
                onClick={() => setShowAdd(!showAdd)}
                style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: showAdd ? '#f4f4f5' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a' }}
              >
                {showAdd ? <X size={14} /> : <Plus size={14} />}
              </button>
            )}
            <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#a1a1aa' }}><X size={16} /></button>
          </div>
        </div>
        
        {showAdd && canManage ? (
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 12, borderBottom: '1px solid #f4f4f5' }}>
              <div style={{ position: 'relative' }}>
                <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa' }} />
                <input 
                  placeholder="Find people to add..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width: '100%', padding: '6px 6px 6px 28px', borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
              {filteredNonMembers.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: '#a1a1aa' }}>No users found</div>
              ) : filteredNonMembers.map(user => (
                <button 
                  key={user.id} 
                  onClick={() => handleAddMember(user.id)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, overflow: 'hidden' }}>
                    {user.avatar_url ? <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.display_name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#18181b' }}>{user.display_name}</div>
                  <Plus size={14} color="#a1a1aa" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            {loading ? (
              <div style={{ padding: 20, textAlign: 'center', fontSize: 12, color: '#a1a1aa' }}>Loading...</div>
            ) : members.map(member => {
              const isExpanded = expandedId === member.id
              const isSelf = member.id === myProfile?.id
              
              return (
                <div key={member.id} style={{ marginBottom: 4 }}>
                  <div 
                    onClick={() => setExpandedId(isExpanded ? null : member.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, position: 'relative', cursor: 'pointer', background: isExpanded ? '#f8fafc' : 'transparent' }} 
                    className="group hover:bg-slate-50 transition-colors"
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, overflow: 'hidden' }}>
                      {member.avatar_url ? <img src={member.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : member.display_name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#18181b', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {member.display_name}
                        {isSelf && <span style={{ fontSize: 10, color: '#a1a1aa', fontWeight: 500 }}>(you)</span>}
                        {member.role === 'admin' && <Shield size={10} color="#7c3aed" />}
                      </div>
                      <div style={{ fontSize: 10, color: '#a1a1aa', textTransform: 'capitalize' }}>
                        {member.channel_role || 'Member'}
                      </div>
                    </div>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColors[member.status] || '#71717a' }} />
                    
                    {canManage && !isSelf && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRemoveMember(member.id); }}
                        style={{ position: 'absolute', right: 8, padding: 4, borderRadius: 4, background: '#fee2e2', color: '#ef4444', border: 'none', cursor: 'pointer', opacity: isExpanded ? 1 : 0 }}
                        className="group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {isExpanded && (
                    <div style={{ margin: '4px 12px 12px 12px', padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: canManage && !isSelf ? 12 : 0 }}>
                        <button 
                          onClick={() => handleMessage(member.id)}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '6px 0', background: '#8b5cf6', color: 'white', borderRadius: 6, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                        >
                          <MessageSquare size={12} /> Message
                        </button>
                        <button 
                          onClick={() => setViewProfileId(member.id)}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '6px 0', background: '#fff', color: '#18181b', borderRadius: 6, fontSize: 11, fontWeight: 600, border: '1px solid #e4e4e7', cursor: 'pointer', transition: 'background 0.2s' }}
                        >
                          <UserCircle size={12} /> Profile
                        </button>
                      </div>
                      
                      {canManage && !isSelf && (
                        <div>
                          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#71717a', marginBottom: 4, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Channel Role</label>
                          <div style={{ position: 'relative' }}>
                            <select 
                              value={member.channel_role || 'member'}
                              onChange={(e) => handleChangeRole(member.id, e.target.value)}
                              style={{ width: '100%', padding: '6px 8px', borderRadius: 6, border: '1px solid #e4e4e7', fontSize: 12, outline: 'none', cursor: 'pointer', background: '#fff', appearance: 'none' }}
                            >
                              <option value="member">Member</option>
                              <option value="moderator">Moderator</option>
                              <option value="leader">Leader</option>
                            </select>
                            <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {viewProfileId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 16, width: 320, position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <button onClick={() => setViewProfileId(null)} style={{ position: 'absolute', top: 16, right: 16, background: '#f4f4f5', borderRadius: '50%', padding: 4, border: 'none', cursor: 'pointer', color: '#71717a' }}><X size={16} /></button>
            {(() => {
              const p = members.find(m => m.id === viewProfileId)
              if (!p) return null
              return (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', margin: '0 auto 16px auto', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 'bold', overflow: 'hidden', boxShadow: '0 8px 16px rgba(139, 92, 246, 0.2)' }}>
                    {p.avatar_url ? <img src={p.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={p.display_name} /> : p.display_name?.slice(0, 2).toUpperCase()}
                  </div>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: 20, fontWeight: 800, color: '#18181b' }}>{p.display_name}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, color: '#71717a', marginBottom: 20 }}>
                    {p.role === 'admin' && <Shield size={12} color="#8b5cf6" />}
                    {p.role === 'admin' ? 'Workspace Admin' : 'Standard User'}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
                    <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', padding: '10px 16px', borderRadius: 12, flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Status</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[p.status] || '#71717a' }} />
                        <span style={{ textTransform: 'capitalize' }}>{p.status}</span>
                      </div>
                    </div>
                    <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', padding: '10px 16px', borderRadius: 12, flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Joined</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                        {p.joined_at ? new Date(p.joined_at).toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => { setViewProfileId(null); handleMessage(p.id); }}
                    style={{ width: '100%', padding: 12, background: '#18181b', color: '#fff', borderRadius: 10, border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    <MessageSquare size={14} /> Send Message
                  </button>
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </>
  )
}
