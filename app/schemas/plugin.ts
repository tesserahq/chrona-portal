import { z } from 'zod'

const invalid_type_error = 'We expect a string here'

export const pluginSchema = z.object({
  name: z
    .string({ invalid_type_error, required_error: "Name can't be blank" })
    .min(1, 'Name is required'),
  description: z.string().optional(),
  endpoint_url: z
    .string({
      invalid_type_error,
      required_error: "Endpoint URL can't be blank",
    })
    .min(1, 'Endpoint Url is required'),
  credential_id: z.string().optional(),
  is_enabled: z.boolean().default(false),
  is_global: z.boolean().default(false),
})

export type PluginSchema = z.infer<typeof pluginSchema>
