'use client'

import { useQuery } from '@tanstack/react-query'
import { useChannelStore } from '@/lib/stores/channelStore'
import { useEffect } from 'react'
import type { Channel } from '@/types/channel'

export function useChannels(workspaceId: string) {
  const { setChannels, setDMChannels } = useChannelStore()

  const query = useQuery({
    queryKey: ['channels', workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/channels?workspaceId=${workspaceId}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.data
    },
    staleTime: 1000 * 30, // 30 seconds
    enabled: !!workspaceId,
  })

  useEffect(() => {
    if (query.data) {
      const all = query.data as Channel[]
      const regular = all.filter(c => c.type !== 'dm')
      const dms = all.filter(c => c.type === 'dm')
      
      setChannels(regular)
      setDMChannels(dms)
    }
  }, [query.data, setChannels, setDMChannels])

  return query
}

export function useDMChannels(userId: string) {
  // This is now handled inside useChannels to avoid double-fetching
  return { data: null }
}
