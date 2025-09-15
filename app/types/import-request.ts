/* eslint-disable @typescript-eslint/no-explicit-any */
interface ISource {
  id: string
  name: string
  description: string
  identifier: string
}

export interface IImportRequestItem {
  id: string
  import_request_id: string
  source_id: string
  source_item_id: string
  raw_payload: any
  status: string
  created_at: string
  updated_at: string
}

export interface IImportRequest {
  source: ISource
  requested_by_id: string
  status: string
  received_count: number
  success_count: number
  failure_count: number
  options: any
  finished_at: string
  project_id: string
  id: string
  created_at: string
  updated_at: string
  items?: IImportRequestItem[]
}
