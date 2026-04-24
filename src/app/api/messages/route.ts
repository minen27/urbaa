import { getSupabaseServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/messages?channelId=xxx&page=0
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const channelId = searchParams.get('channelId')
  const page      = parseInt(searchParams.get('page') ?? '0')
  const pageSize  = 40

  if (!channelId) {
    return NextResponse.json({ error: 'channelId required' }, { status: 400 })
  }

  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Updated to use user_id and deleted_at
  // Verify membership first
  const { data: membership } = await supabaseAdmin
    .from('channel_members')
    .select('user_id')
    .eq('channel_id', channelId)
    .eq('user_id', user.id)
    .single()

  if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Use admin client to ensure messages are ALWAYS returned regardless of RLS cache
  const { data, error } = await supabaseAdmin
    .from('messages')
    .select(`
      *,
      sender:profiles!user_id(id, display_name, avatar_url, status)
    `)
    .eq('channel_id', channelId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data: (data ?? []).reverse() })
}

// POST /api/messages
export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { channel_id, content, file_url, file_type } = body

  if (!channel_id || (!content && !file_url)) {
    return NextResponse.json({ error: 'channel_id and content or file required' }, { status: 400 })
  }

  // Step 1: Insert using user_id
  const { data: message, error: insertError } = await supabaseAdmin
    .from('messages')
    .insert({ 
      channel_id, 
      user_id: user.id, 
      content, 
      file_url
    })
    .select()
    .single()

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  // Step 2: Fetch profile
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, display_name, avatar_url, status')
    .eq('id', user.id)
    .single()

  const fullMessage = {
    ...message,
    sender: profile,
    reactions: []
  }

  return NextResponse.json({ data: fullMessage }, { status: 201 })
}
