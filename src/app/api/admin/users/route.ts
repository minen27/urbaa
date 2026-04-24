import { getSupabaseServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Security: Only admins can list ALL users
    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all profiles
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('display_name', { ascending: true })

    if (error) throw error

    return NextResponse.json({ data: profiles })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
