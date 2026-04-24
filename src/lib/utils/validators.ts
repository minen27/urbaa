import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z.object({
  display_name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

export const channelSchema = z.object({
  name: z
    .string()
    .min(2, 'Channel name must be at least 2 characters')
    .max(80)
    .regex(/^[a-z0-9-_]+$/, 'Use only lowercase letters, numbers, hyphens, underscores'),
  description: z.string().max(250).optional(),
  type: z.enum(['public', 'private']),
})

export const profileSchema = z.object({
  display_name: z.string().min(2).max(50),
  status: z.enum(['online', 'away', 'busy', 'offline']),
})

export const messageSchema = z.object({
  content: z.string().min(1).max(4000),
})

export type LoginFormData    = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ChannelFormData  = z.infer<typeof channelSchema>
export type ProfileFormData  = z.infer<typeof profileSchema>
export type MessageFormData  = z.infer<typeof messageSchema>
