/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IngestSettings {
  data_dir?: string
  hnsw_m?: number
  hnsw_ef_construction?: number
  hnsw_ef_search?: number
  hnsw_dist_method?: string
  openai_api_key?: string | null
}

export interface IProject {
  id: string
  name: string
  description: string
  workspace_id: string
  created_at: string
  updated_at: string
  labels?: any
  quore_project_id?: string
}
