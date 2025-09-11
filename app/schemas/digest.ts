import { z } from 'zod'

export const digestGenerationConfigSchema = z.object({
  title: z.string().min(1, 'Title should have at least 1 character'),
  tags: z.array(z.string()).optional().default([]),
  labels: z
    .record(z.any())
    .refine((obj) => Object.keys(obj).length > 0, {
      message: 'Labels must have at least one property',
    }),
  system_prompt: z.string().optional(),
  timezone: z.string().optional(),
  generate_empty_digest: z.boolean().optional().default(false),
  cron_expression: z.string().optional(),
})
