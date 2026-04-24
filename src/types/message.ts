// ─── Message ──────────────────────────────────────────────────────────────────

import type { Profile } from './user'

export interface Reaction {
  id: string
  message_id: string
  user_id: string
  emoji: string
}

export interface ReactionGroup {
  emoji: string
  count: number
  userIds: string[]
  reacted: boolean // did current user react?
}

export interface Message {
  id: string
  channel_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string | null
  deleted_at: string | null
  reply_to_id: string | null
  file_url: string | null
  file_type: string | null
  // Joined relations
  sender?: Profile
  reactions?: Reaction[]
  reply_to?: {
    id: string
    content: string
    sender?: Pick<Profile, 'display_name'>
  } | null
  // Optimistic flag
  isPending?: boolean
}

export interface TypingUser {
  userId: string
  displayName: string
}
