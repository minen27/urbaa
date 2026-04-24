import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

type Params = { params: Promise<{ id: string; user_id: string }> }

// ── PATCH /api/channels/[id]/members/[user_id]/role ───────────────────────────
// Change a member's role. Caller must be the channel leader OR a global admin.
export async function PATCH(req: NextRequest, { params }: Params) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: channelId, user_id } = await params
  const body = await req.json()
  const { role } = body as { role?: string }

  if (!role || !['leader', 'moderator', 'member'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role. Must be leader, moderator, or member.' }, { status: 400 })
  }

  // Check caller permission: must be global admin OR the channel leader
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
      return NextResponse.json({ error: 'Forbidden: only a channel leader or global admin can change roles' }, { status: 403 })
    }
  }

  const { error } = await supabaseAdmin
    .from('channel_members')
    .update({ role })
    .eq('channel_id', channelId)
    .eq('user_id', user_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // If promoting to leader, also update channels.leader_id
  if (role === 'leader') {
    await supabaseAdmin
      .from('channels')
      .update({ leader_id: user_id })
      .eq('id', channelId)
  }

  return NextResponse.json({ ok: true })
}
