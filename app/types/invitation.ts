export interface Invitation {
  email: string
  role: string
  message: string
  id: string
  workspace_id: string
  inviter_id: string
  expires_at: string
  created_at: string
  updated_at: string
  workspace: Workspace
  inviter: Inviter
}

export interface Workspace {
  name: string
  description: string
  logo: string
  identifier: string
  created_by_id: string
  locked: boolean
  id: string
  created_at: string
  updated_at: string
  created_by: User
}

export interface User {
  id: string
  email: string
  avatar_url: string
  first_name: string
  last_name: string
  provider: string
  verified: boolean
  verified_at: string
}

export interface Inviter extends User {
  username: string
  confirmed_at: string
  created_at: string
  updated_at: string
}

export interface IMembership {
  user_id: string
  workspace_id: string
  role: string
  created_by_id: string
  id: string
  created_at: string
  updated_at: string
  user: IMemberUser
  created_by: IMemberUser
}

export interface IMemberUser {
  id: string
  email: string
  username: string
  avatar_url: string
  first_name: string
  last_name: string
  provider: string
  confirmed_at: string
  verified: boolean
  verified_at: string
  created_at: string
  updated_at: string
}
