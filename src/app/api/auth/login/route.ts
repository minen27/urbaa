import { getSupabaseServerClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/utils/validators'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  return NextResponse.json({ user: data.user }, { status: 200 })
}
