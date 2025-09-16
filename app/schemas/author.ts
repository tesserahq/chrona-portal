import { z } from 'zod'

export const authorSchema = z.object({
  display_name: z.string().min(1, 'Display name is required'),
  avatar_url: z.string().optional().or(z.literal('')),
  email: z.string().email('Email must be a valid email address'),
  tags: z.array(z.string()).optional().default([]),
  labels: z.record(z.any()).optional().default({}),
  meta_data: z.record(z.any()).optional().default({}),
})
