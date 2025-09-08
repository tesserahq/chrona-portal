export interface IPrompt {
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
