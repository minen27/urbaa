'use client'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import Image from 'next/image'

export function OAuthButton({ provider = 'google' }: { provider?: 'google' }) {
  const handleOAuth = async () => {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
  }

  return (
    <button
      onClick={handleOAuth}
      type="button"
      className="w-full flex items-center justify-center gap-3 px-4 py-2.5
                 border border-surface-200 dark:border-surface-700 rounded-xl
                 text-sm font-medium text-zinc-700 dark:text-zinc-300
                 hover:bg-surface-50 dark:hover:bg-surface-800
                 transition-colors duration-150"
    >
      <Image
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google"
        width={18}
        height={18}
      />
      Continue with Google
    </button>
  )
}
