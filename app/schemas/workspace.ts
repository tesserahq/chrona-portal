import { z } from 'zod'

const invalid_type_error = 'We expect a string here'
const required_error = "Name can't be blank"

export const workspaceSchema = z.object({
  name: z.string({ invalid_type_error, required_error }).min(1, 'Name is required'),
  identifier: z.string().min(1, 'Identifier is required'),
  description: z.string().optional(),
  locked: z.boolean().default(false),
  system_prompt: z.string().optional(),
})

export type WorkspaceSchema = z.infer<typeof workspaceSchema>
