import { z } from 'zod'

const invalid_type_error = 'We expect a string here'

export const invitationSchema = z.object({
  email: z
    .string({ invalid_type_error, required_error: "Email can't be blank" })
    .email('Email is not valid'),
  role: z
    .string({ invalid_type_error, required_error: "Role can't be blank" })
    .min(1, 'Role is required'),
  message: z.string().optional(),
})

export type InvitationSchema = z.infer<typeof invitationSchema>
