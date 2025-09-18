import { z } from 'zod'

export const gazetteSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  header: z.string().min(1, 'Header is required'),
  subheader: z.string(),
  theme: z.string(),
  project_id: z.string().min(1, 'Project ID is required'),
  tags: z.array(z.string()).optional().default([]),
  labels: z.record(z.any()).optional().default({}),
})
