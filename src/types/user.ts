// ─── User & Profile ──────────────────────────────────────────────────────────

export type UserStatus = 'online' | 'away' | 'busy' | 'offline'
export type UserRole = 'user' | 'admin'

export interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
  status: UserStatus
  role: UserRole
  is_active: boolean
  /** Unique login handle used by admins on first login (null for regular users) */
  admin_id: string | null
  /** False until admin completes the first-time setup (email + password). Always true for regular users. */
  password_changed: boolean
  created_at: string
}

export interface AuthUser {
  id: string
  /** Null for admins who have not yet completed first-time setup */
  email: string | null
  profile: Profile
}
