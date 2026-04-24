import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { z } from 'zod'

const setupSchema = z.object({
  display_name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(req: Request) {
  // Verify the caller is an authenticated admin with password_changed = false
  const supabase = await getSupabaseServerClient()
  const { data: { user }, error: userErr } = await supabase.auth.getUser()

  if (userErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Confirm they're an admin who hasn't completed setup yet
  const { data: profile, error: profileErr } = await supabaseAdmin
    .from('profiles')
    .select('role, password_changed')
    .eq('id', user.id)
    .single()

  if (profileErr || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }
  if (profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (profile.password_changed) {
    // Already set up — block re-use of this endpoint
    return NextResponse.json({ error: 'Setup already completed' }, { status: 409 })
  }

  const body = await req.json()
  const parsed = setupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }
  const { display_name, email, password } = parsed.data

  // Update Supabase Auth: set real email + password
  const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    email,
    password,
    email_confirm: true, // skip email verification for admins
  })
  if (authErr) {
    return NextResponse.json({ error: authErr.message }, { status: 500 })
  }

  // Update profiles table: display_name + mark setup done
  const { error: updateErr } = await supabaseAdmin
    .from('profiles')
    .update({ display_name, password_changed: true })
    .eq('id', user.id)

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
