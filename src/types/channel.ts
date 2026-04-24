// ─── Channel ──────────────────────────────────────────────────────────────────

import type { Profile } from './user'

export type ChannelType = 'public' | 'private' | 'dm'
export type ChannelMemberRole = 'leader' | 'moderator' | 'member'

export interface Channel {
  id: string
  workspace_id: string
  name: string
  description: string | null
  type: ChannelType
  created_by: string
  /** UUID of the user designated as channel leader; null if none assigned yet */
  leader_id: string | null
  created_at: string
}

export interface ChannelMember {
  channel_id: string
  user_id: string
  role: ChannelMemberRole
  joined_at: string
  user?: Profile
}

export interface DMChannel extends Channel {
  other_user: Profile
}

export interface Workspace {
  id: string
  name: string
  icon_url: string | null
  owner_id: string
  created_at: string
}
