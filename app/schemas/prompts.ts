import { z } from 'zod'

const invalid_type_error = 'We expect a string here'

export const promptSchema = z.object({
  name: z
    .string({ invalid_type_error, required_error: "Name can't be blank" })
    .min(1, 'Name is required'),
  prompt_id: z
    .string({
      invalid_type_error,
      required_error: "Prompt ID can't be blank",
    })
    .min(1, 'Prompt ID is required'),
  prompt: z
    .string({
      invalid_type_error,
      required_error: "Prompt can't be blank",
    })
    .min(1, 'Prompt is required'),
  notes: z.string(),
})

export type PromptSchema = z.infer<typeof promptSchema>
