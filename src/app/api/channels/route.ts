import { getSupabaseServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/channels?workspaceId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const workspaceId = searchParams.get('workspaceId')

  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch channels where the user is a member
  const { data, error } = await supabaseAdmin
    .from('channels')
    .select(`
      *,
      members:channel_members!inner(user_id),
      all_members:channel_members(
        user:profiles(id, display_name, avatar_url, status)
      )
    `)
    .eq('workspace_id', workspaceId ?? 'default')
    .eq('members.user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST /api/channels
export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { workspace_id, name, description, type } = body

  if (!workspace_id || !name) {
    return NextResponse.json({ error: 'workspace_id and name are required' }, { status: 400 })
  }

  // Use admin client to bypass RLS for the role check
  const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 })
  }

  const { data: channel, error } = await supabaseAdmin
    .from('channels')
    .insert({ workspace_id, name, description, type: type ?? 'public' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Auto-join creator
  await supabaseAdmin.from('channel_members').insert({ channel_id: channel.id, user_id: user.id })

  return NextResponse.json({ data: channel }, { status: 201 })
}
