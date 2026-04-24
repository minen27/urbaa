import { getSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()
    await supabase.auth.signOut()
  } catch {}

  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  const response = NextResponse.redirect(
    new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
  )

  // Delete every sb- cookie
  for (const cookie of allCookies) {
    if (cookie.name.startsWith('sb-')) {
      response.cookies.set(cookie.name, '', {
        maxAge: 0,
        path: '/',
        expires: new Date(0),
      })
    }
  }

  return response
}

export async function POST() {
  return GET()
}
