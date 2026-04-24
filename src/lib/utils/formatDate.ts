import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns'

export function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr)
  return format(date, 'h:mm a')
}

export function formatDividerDate(dateStr: string): string {
  const date = new Date(dateStr)
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMMM d, yyyy')
}

export function formatRelativeTime(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
}

export function isSameDay(a: string, b: string): boolean {
  return format(new Date(a), 'yyyy-MM-dd') === format(new Date(b), 'yyyy-MM-dd')
}

export function formatFullDate(dateStr: string): string {
  return format(new Date(dateStr), 'PPpp')
}
