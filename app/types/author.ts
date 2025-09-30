/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IAuthor {
  id: string
  display_name: string
  avatar_url: string
  email: string
  tags: string[]
  labels: Record<string, any>
  meta_data: Record<string, any>
  user_id: string
  sources: [
    {
      id: string
      identifier: string
      name: string
    },
  ]
}
