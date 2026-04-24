import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupBuckets() {
  const bucketsToCreate = ['avatars', 'chat-files']
  
  for (const name of bucketsToCreate) {
    const { data, error } = await supabase.storage.createBucket(name, {
      public: name === 'avatars', // avatars is public, chat-files is private
    })
    if (error && error.message !== 'The resource already exists') {
      console.error(`Error creating ${name}:`, error)
    } else {
      console.log(`Bucket ${name} ensured.`)
    }
  }
}
setupBuckets()
