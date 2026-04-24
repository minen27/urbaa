import { getSupabaseBrowserClient } from './client'

const BUCKET = 'chat-files'

export async function uploadFile(file: File, path: string) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) return { url: null, error }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path)
  return { url: urlData.publicUrl, error: null }
}

export async function getSignedUrl(path: string, expiresIn = 3600) {
  return getSupabaseBrowserClient()
    .storage.from(BUCKET)
    .createSignedUrl(path, expiresIn)
}

export async function deleteFile(path: string) {
  return getSupabaseBrowserClient()
    .storage.from(BUCKET)
    .remove([path])
}

export function buildFilePath(channelId: string, fileName: string): string {
  const timestamp = Date.now()
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `${channelId}/${timestamp}-${sanitized}`
}

export function buildAvatarPath(userId: string, fileName: string): string {
  const ext = fileName.split('.').pop()
  return `avatars/${userId}.${ext}`
}
