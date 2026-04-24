import { getSupabaseServerClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

const schema = z.object({
  current_password: z.string(),
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: parsed.data.current_password
  })

  if (signInError) {
    return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 })
  }

  // Now update the password
  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.new_password
  })

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 })
  }

  return NextResponse.json({ success: true }, { status: 200 })
}
