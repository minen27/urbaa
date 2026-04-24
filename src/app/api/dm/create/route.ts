import { supabaseAdmin } from '@/lib/supabase/admin'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { targetUserId } = await req.json()
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (user.id === targetUserId) {
      return NextResponse.json({ error: 'You cannot DM yourself' }, { status: 400 })
    }

    // 1. Check if DM already exists
    // We look for a channel of type 'dm' that has both users as members
    const { data: existingDMs, error: findError } = await supabaseAdmin
      .rpc('find_dm_channel', { user1: user.id, user2: targetUserId })

    if (existingDMs && existingDMs.length > 0) {
      return NextResponse.json({ data: existingDMs[0] })
    }

    // 2. Create new DM channel
    const { data: channel, error: createError } = await supabaseAdmin
      .from('channels')
      .insert({
        name: `dm-${user.id}-${targetUserId}`,
        type: 'dm',
        workspace_id: 'default' // Or fetch current workspace
      })
      .select()
      .single()

    if (createError) throw createError

    // 3. Add both members
    await supabaseAdmin.from('channel_members').insert([
      { channel_id: channel.id, user_id: user.id },
      { channel_id: channel.id, user_id: targetUserId }
    ])

    return NextResponse.json({ data: channel })
  } catch (err: any) {
    console.error('DM CREATE ERROR:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
