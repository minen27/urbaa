import { supabaseAdmin } from '@/lib/supabase/admin'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: channelId } = await params
    const { userId } = await req.json()

    if (!channelId || channelId === 'undefined') {
      return NextResponse.json({ error: 'Channel ID is missing' }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Security check: only admins can add people to channels
    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', currentUser.id).single()
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Add member
    const { error } = await supabaseAdmin
      .from('channel_members')
      .insert({ channel_id: channelId, user_id: userId })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'User is already a member' }, { status: 400 })
      }
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
