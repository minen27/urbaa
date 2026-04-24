import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setup() {
  const { data, error } = await supabase
    .from('workspaces')
    .insert({ id: 'default', name: 'Main Workspace', slug: 'main' })
    .select()
    .maybeSingle()

  if (error && error.code !== '23505') { // Ignore unique violation if it exists
    console.error('Failed to create default workspace:', error)
  } else {
    console.log('Default workspace ensures exist.')
  }
}

setup()
