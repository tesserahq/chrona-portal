/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IDigestGenerator {
  title: string
  filter_tags: string[]
  filter_labels: Record<string, any>
  tags: string[]
  labels: Record<string, any>
  system_prompt: string
  timezone: string
  generate_empty_digest: boolean
  cron_expression: string
  project_id: string
  id: string
  created_at: string
  updated_at: string
  deleted_at: string
}
