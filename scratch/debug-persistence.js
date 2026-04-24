import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function debugMessages() {
  console.log('--- DEBUGGING MESSAGES ---')
  
  // 1. Get all channels
  const { data: channels } = await supabase.from('channels').select('id, name, type')
  console.log('Total Channels:', channels?.length)
  console.log('Channels List:', channels)

  // 2. Get last 10 messages from ANY channel
  const { data: messages, error } = await supabase
    .from('messages')
    .select('id, content, channel_id, user_id, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching messages:', error)
  } else {
    console.log('Last 10 messages in DB:', messages)
  }

  // 3. Check membership for a sample channel if possible
  if (channels && channels.length > 0) {
    const { data: members } = await supabase
      .from('channel_members')
      .select('*')
      .eq('channel_id', channels[0].id)
    console.log(`Members of channel ${channels[0].name}:`, members)
  }
}

debugMessages()
