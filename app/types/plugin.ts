/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IPlugin {
  id: string
  name: string
  description: string
  state: string
  state_description?: string
  repository_url?: string
  version?: string
  commit_hash?: string | null
  endpoint_url?: string | null
  plugin_metadata?: string | null
  credential_id?: string
  workspace_id?: string
  created_at?: string
  updated_at?: string
  tools?: any
  resources?: any
  prompts?: any
  is_enabled?: boolean
  is_global?: boolean
}

export interface PluginInput {
  name: string
  description: string
  author?: string
  credential_id?: string
  endpoint_url?: string
  is_enabled?: boolean
  is_global?: boolean
}
