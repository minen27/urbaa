import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function test() {
  const payload = {
    workspace_id: 'default',
    name: 'test-channel-script-2',
    type: 'public',
  }

  const { data, error } = await supabase.from('channels').insert(payload).select().single()
  console.log('Result without created_by:', data)
  console.log('Error:', error)
}
test()
