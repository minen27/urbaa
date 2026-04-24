import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function test() {
  const { data, error } = await supabase.auth.admin.listUsers()
  if (error) console.error(error)
  else {
    console.log('Registered Users:')
    data.users.forEach(u => {
      console.log(`- Email: ${u.email} | Confirmed: ${u.email_confirmed_at ? 'Yes' : 'No'}`)
    })
  }
}
test()
