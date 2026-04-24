import { getSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/notifications  — save FCM device token
export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { userId, token } = await req.json()
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 })

  const { error } = await supabase
    .from('fcm_tokens')
    .upsert({ user_id: userId ?? user.id, token }, { onConflict: 'user_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
