import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

type Params = { params: Promise<{ id: string; user_id: string }> }

// ── DELETE /api/channels/[id]/members/[user_id] ───────────────────────────────
// Remove a member from a channel. Caller must be channel leader OR global admin.
export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: channelId, user_id } = await params

  // Check caller permission
  const { data: callerProfile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isGlobalAdmin = callerProfile?.role === 'admin'

  if (!isGlobalAdmin) {
    const { data: callerMembership } = await supabaseAdmin
      .from('channel_members')
      .select('role')
      .eq('channel_id', channelId)
      .eq('user_id', user.id)
      .single()

    if (callerMembership?.role !== 'leader') {
      return NextResponse.json(
        { error: 'Forbidden: only a channel leader or global admin can remove members' },
        { status: 403 }
      )
    }
  }

  // Prevent removing yourself if you're the leader
  if (user_id === user.id) {
    return NextResponse.json({ error: 'You cannot remove yourself from the channel' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('channel_members')
    .delete()
    .eq('channel_id', channelId)
    .eq('user_id', user_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // If removed user was the leader, clear channels.leader_id
  const { data: channel } = await supabaseAdmin
    .from('channels')
    .select('leader_id')
    .eq('id', channelId)
    .single()

  if (channel?.leader_id === user_id) {
    await supabaseAdmin
      .from('channels')
      .update({ leader_id: null })
      .eq('id', channelId)
  }

  return NextResponse.json({ ok: true })
}
