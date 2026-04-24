import { getSupabaseServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/files  — returns a signed upload URL
export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { path } = await req.json()
  if (!path) return NextResponse.json({ error: 'path required' }, { status: 400 })

  const { data, error } = await supabase.storage
    .from('chat-files')
    .createSignedUploadUrl(path)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ signedUrl: data.signedUrl, token: data.token, path: data.path })
}
