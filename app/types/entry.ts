export interface IEntryAuthor {
  display_name: string
  avatar_url: string
  email: string
  tags: string[]
  labels: Record<string, string>
  meta_data: Record<string, unknown>
  id: string
  workspace_id: string
  user_id: string | null
  created_at: string
  updated_at: string
}

export interface IEntrySourceAuthor {
  author_id: string
  source_id: string
  source_author_id: string
  id: string
  created_at: string
  updated_at: string
  author: IEntryAuthor
}

export interface IEntrySource {
  name: string
  description: string
  identifier: string
  id: string
  workspace_id: string
  created_at: string
  updated_at: string
}

// Full entry with nested objects (for list view)
export interface IEntry {
  title: string
  body: string
  source_id: string
  external_id: string
  tags: string[]
  labels: Record<string, string>
  meta_data: Record<string, unknown>
  source_author_id: string
  project_id: string
  id: string
  created_at: string
  updated_at: string
  source: IEntrySource
  source_author: IEntrySourceAuthor
}

export interface IEntriesResponse {
  data: IEntry[]
}
