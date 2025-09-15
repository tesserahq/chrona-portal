/* eslint-disable @typescript-eslint/no-explicit-any */
interface ISource {
  id: string
  name: string
  description: string
  identifier: string
}

export interface IImportRequest {
  source: ISource
  requested_by_id: string
  status: string
  received_count: number
  success_count: number
  failure_count: number
  options: any
  finished_at: string // ISO date string
  project_id: string
  id: string
  created_at: string // ISO date string
  updated_at: string // ISO date string
}
