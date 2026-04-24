'use client'

import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'use-debounce'
import { searchMessages, searchChannels, searchUsers } from '@/lib/supabase/search'

export function useSearch(query: string, workspaceId: string) {
  const [debouncedQuery] = useDebounce(query, 350)
  const enabled = debouncedQuery.trim().length > 2

  const messages = useQuery({
    queryKey: ['search-messages', debouncedQuery, workspaceId],
    queryFn: () => searchMessages(debouncedQuery, workspaceId),
    enabled,
    staleTime: 1000 * 30,
  })

  const channels = useQuery({
    queryKey: ['search-channels', debouncedQuery, workspaceId],
    queryFn: () => searchChannels(debouncedQuery, workspaceId),
    enabled,
    staleTime: 1000 * 60,
  })

  const users = useQuery({
    queryKey: ['search-users', debouncedQuery],
    queryFn: () => searchUsers(debouncedQuery),
    enabled,
    staleTime: 1000 * 60,
  })

  return {
    messages: messages.data?.data ?? [],
    channels: channels.data?.data ?? [],
    users: users.data?.data ?? [],
    isLoading: messages.isLoading || channels.isLoading || users.isLoading,
    hasResults: enabled,
  }
}
