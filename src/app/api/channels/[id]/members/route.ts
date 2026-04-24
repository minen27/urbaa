import { supabaseAdmin } from '@/lib/supabase/admin'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: channelId } = await params

    const { data, error } = await supabaseAdmin
      .from('channel_members')
      .select(`
        channel_id,
        user_id,
        role,
        joined_at,
        profiles ( id, display_name, avatar_url, status, role )
      `)
      .eq('channel_id', channelId)
      .order('joined_at', { ascending: true })

    if (error) throw error

    // Flatten the nested profiles array to return a list of profiles
    // and attach the channel role and joined date to it
    const flattenedMembers = data.map((item: any) => ({
      ...item.profiles,
      channel_role: item.role,
      joined_at: item.joined_at,
    }))

    return NextResponse.json({ data: flattenedMembers })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
