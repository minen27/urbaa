// ─── Notification ─────────────────────────────────────────────────────────────

export interface FCMToken {
  id: string
  user_id: string
  token: string
  created_at: string
}

export interface PushNotificationPayload {
  title: string
  body: string
  channelId?: string
  workspaceId?: string
  messageId?: string
}
