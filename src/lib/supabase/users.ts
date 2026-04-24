import { getSupabaseBrowserClient } from './client'
import type { Profile, UserStatus, UserRole } from '@/types/user'

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function fetchUserProfile(userId: string) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data: data as Profile | null, error }
}

export async function fetchWorkspaceMembers(workspaceId: string) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('workspace_members')
    .select('user:profiles!user_id(*)')
    .eq('workspace_id', workspaceId)
  return { data: data ?? [], error }
}

/** Admin: fetch all profiles */
export async function fetchAllUsers() {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  return { data: (data ?? []) as Profile[], error }
}

// ─── Write ────────────────────────────────────────────────────────────────────

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'display_name' | 'avatar_url' | 'status'>>
) {
  return getSupabaseBrowserClient()
    .from('profiles')
    .update(updates)
    .eq('id', userId)
}

export async function updateUserStatus(userId: string, status: UserStatus) {
  return getSupabaseBrowserClient()
    .from('profiles')
    .update({ status })
    .eq('id', userId)
}

// ─── Admin-only (proxied through API routes using service role) ───────────────

export async function adminUpdateRole(userId: string, role: UserRole) {
  // Called via /api/users/[id] which uses supabaseAdmin
  return fetch(`/api/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function adminDeactivateUser(userId: string) {
  return fetch(`/api/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: false }),
    headers: { 'Content-Type': 'application/json' },
  })
}
