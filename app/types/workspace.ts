/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IUser {
  avatar_url: string
  email: string
  first_name: string
  id: string
  last_name: string
  provider: string | null
  verified: boolean
  verified_at: string | null
}

export interface IWorkspace {
  id: string
  name: string
  description: string
  logo: string | null
  created_at: string
  updated_at: string
  created_by_id: string
  created_by: IUser
  locked: boolean
  quore_workspace_id?: string
}

export interface IWorkspaceLogo {
  name: string
  colors: string[]
  variant: string
}

export const avatarVariants = ['beam', 'pixel', 'bauhaus', 'ring', 'sunset', 'marble']

export const avatarName = 'Mary Baker'

export const avatarColors = [
  // Fresh & Calm
  ['#49b9c7', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'],

  // Soft Pastel
  ['#49b9c7', '#a8dadc', '#f1faee', '#457b9d', '#1d3557'],

  // Vibrant Contrast
  ['#49b9c7', '#ff6b6b', '#ff9f1c', '#6a4c93', '#1982c4'],

  // Elegant Minimal
  ['#49b9c7', '#264653', '#2a9d8f', '#e9c46a', '#f4a261'],

  // Playful & Bright
  ['#49b9c7', '#ffd166', '#06d6a0', '#ef476f', '#073b4c'],
]

export interface ICredential {
  id: string
  name: string
  type: string
  workspace_id: string
  created_by: IUser
  created_at: string
  updated_at: string
  fields: Record<string, string>
}

interface ICredentialField {
  help: string
  input_type: string
  label: string
  name: string
  required: boolean
  type: string
  value?: string
  error?: string
}

export interface ICredentialType {
  type_name: string
  display_name: string
  fields: ICredentialField[]
}

export interface IWorkspaceMembership {
  user_id: string
  workspace_id: string
  role: string
  created_by_id: string
  id: string
  created_at: string
  updated_at: string
}

// Workspcse Stats
interface IProjectStats {
  id: string
  name: string
  description: string
  updated_at: string // ISO date string
}

export interface IWorkspaceStats {
  project_stats: {
    total_projects: number
    recent_projects: IProjectStats[]
  }
}
