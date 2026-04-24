import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

type Params = { params: Promise<{ id: string }> }

// ── PATCH /api/admin/users/[id]/role ─────────────────────────────────────────
// Change a user's global role (admin only).
export async function PATCH(req: NextRequest, { params }: Params) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: callerProfile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (callerProfile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id: targetId } = await params
  const body = await req.json()
  const { role } = body as { role?: string }

  if (!role || !['user', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role. Must be user or admin.' }, { status: 400 })
  }

  // Prevent admin from demoting themselves
  if (targetId === user.id && role !== 'admin') {
    return NextResponse.json({ error: 'You cannot change your own admin role' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ role })
    .eq('id', targetId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
