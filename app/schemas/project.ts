import { z } from 'zod'

const invalid_type_error = 'We expect a string here'

export const projectSchema = z.object({
  name: z
    .string({ invalid_type_error, required_error: "Name can't be blank" })
    .min(1, 'Name is required'),
  description: z.string().optional(),
  quore_project_id: z.string().optional(),
  labels: z.string().optional(),
})

export type ProjectSchema = z.infer<typeof projectSchema>
