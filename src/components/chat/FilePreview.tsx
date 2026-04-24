'use client'

import { FileText, Download, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

interface FilePreviewProps {
  url: string
  fileType: string
  className?: string
}

function getFileName(url: string) {
  return decodeURIComponent(url.split('/').pop()?.split('?')[0] ?? 'file')
}

export function FilePreview({ url, fileType, className }: FilePreviewProps) {
  const isImage = fileType.startsWith('image/')
  const isVideo = fileType.startsWith('video/')
  const fileName = getFileName(url)

  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={cn('block mt-2 max-w-sm', className)}>
        <Image
          src={url}
          alt={fileName}
          width={400}
          height={300}
          className="rounded-xl object-cover max-h-64 w-auto border border-surface-200 dark:border-surface-700 hover:opacity-95 transition-opacity"
        />
      </a>
    )
  }

  if (isVideo) {
    return (
      <video
        src={url}
        controls
        className={cn('mt-2 max-w-sm rounded-xl max-h-64', className)}
      />
    )
  }

  // Document / generic file
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download={fileName}
      className={cn(
        'flex items-center gap-3 mt-2 px-3 py-2.5 max-w-xs',
        'border border-surface-200 dark:border-surface-700 rounded-xl',
        'bg-surface-50 dark:bg-surface-800',
        'hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors',
        className
      )}
    >
      <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
        <FileText size={18} className="text-primary-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{fileName}</p>
        <p className="text-xs text-zinc-400">{fileType || 'File'}</p>
      </div>
      <Download size={14} className="text-zinc-400 shrink-0" />
    </a>
  )
}
