import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
async function test() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'messages' })
  console.log('Columns (RPC):', data, error)
  
  // If RPC doesn't exist, try direct query
  const { data: data2, error: error2 } = await supabase
    .from('messages')
    .insert({ content: 'test' })
    .select()
  console.log('Insert attempt:', data2, error2)
}
test()
