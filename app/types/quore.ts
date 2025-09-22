export interface IQuorePrompt {
  id?: string
  name: string
  prompt_id: string
  type: string
  prompt: string
  notes: string
  created_by_id: string
  workspace_id: string
  created_at?: string
  updated_at?: string
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IQuoreIngestSettings {
  data_dir?: string
  hnsw_m?: number
  hnsw_ef_construction?: number
  hnsw_ef_search?: number
  hnsw_dist_method?: string
  openai_api_key?: string | null
}

export interface IQuoreProject {
  name: string
  description: string
  workspace_id: string
  ingest_settings: IQuoreIngestSettings
  llm_provider: string
  embed_model: string
  llm: string
  id: string
  created_at: string
  updated_at: string
  embed_dim: number
  labels?: any
  system_prompt?: any
}
