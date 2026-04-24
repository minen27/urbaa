import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const body = await req.json()
  const { admin_id } = body as { admin_id?: string }

  if (!admin_id?.trim()) {
    return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 })
  }

  // Look up the admin profile by their unique admin_id handle
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('id, role, admin_id, password_changed')
    .eq('admin_id', admin_id.trim())
    .eq('role', 'admin')
    .single()

  if (error || !profile) {
    console.error('[admin-login] DB Error:', error)
    // Generic error — don't reveal whether the ID exists
    return NextResponse.json({ error: 'Invalid Admin ID' }, { status: 401 })
  }

  // Get the actual email from Supabase Auth
  const { data: authData } = await supabaseAdmin.auth.admin.getUserById(profile.id)
  
  // Generate a one-time magic link so the admin can get a session
  // without needing a password (first login) or email verification.
  const placeholderEmail = authData.user?.email ?? `admin-${profile.id}@internal.urba`

  // Generate a temporary password to seamlessly log the client in
  const tempPassword = crypto.randomUUID() + 'A1!'

  const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(profile.id, {
    password: tempPassword,
  })

  if (updateErr) {
    console.error('[admin-login] Update Error:', updateErr)
    return NextResponse.json({ error: 'Failed to prepare login' }, { status: 500 })
  }

  return NextResponse.json({
    firstLogin: !profile.password_changed,
    email: placeholderEmail,
    tempPassword: tempPassword,
  })
}

