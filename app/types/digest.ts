import { IEntry } from './entry'

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IDigestGenerator {
  title: string
  query: string
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
  ui_format: any
}

export interface IDigest {
  title: string
  body: string
  entries_ids: string[]
  tags: string[]
  labels: Record<string, any>
  from_date: string
  to_date: string
  digest_generation_config_id: string
  digest_generation_config: IDigestGenerator
  project_id: string
  id: string
  status: string
  created_at: string
  updated_at: string
  deleted_at: string
  ui_format?: {
    color?: string
  }
  entries?: IEntry[]
}

export interface IDigestPaginationResponse {
  items: IDigest[]
  total: number
  page: number
  size: number
  pages: number
}
