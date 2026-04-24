import { getSupabaseServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  email:        z.string().email(),
  password:     z.string().min(8),
  display_name: z.string().min(2).max(50),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.auth.signUp({
    email:    parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.display_name, role: 'user' },
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  if (data.user) {
    // Wait a brief moment for the DB trigger to create the profile
    await new Promise(r => setTimeout(r, 500))
    await supabaseAdmin.from('profiles').update({ role: 'user' }).eq('id', data.user.id)
  }

  return NextResponse.json({ user: data.user }, { status: 201 })
}
