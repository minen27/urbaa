import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function confirmAllUsers() {
  // We don't have direct access to auth.users via normal select without rpc, 
  // but we can list users via the admin API
  const { data: { users }, error } = await supabase.auth.admin.listUsers()
  
  if (error) {
    console.error('Error fetching users:', error)
    return
  }

  for (const user of users) {
    if (!user.email_confirmed_at) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { email_confirm: true }
      )
      if (updateError) {
        console.error(`Failed to confirm user ${user.email}:`, updateError)
      } else {
        console.log(`Confirmed email for user: ${user.email}`)
      }
    }
  }
  console.log('Finished confirming users.')
}

confirmAllUsers()
