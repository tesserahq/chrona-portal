import { z } from 'zod'

export const sourceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  identifier: z.string().min(1, 'Identifier is required'),
})

