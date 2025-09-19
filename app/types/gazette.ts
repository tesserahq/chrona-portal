import { IDigest } from './digest'

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IGazette {
  id: string
  name: string
  header: string
  subheader: string
  theme: string
  tags: string[]
  labels: Record<string, any>
  project_id: string
  share_key?: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface IShareResponse {
  share_key: string
}

export interface ISection {
  name: string
  header: string
  subheader: string
  tags: string[]
  labels: Record<string, any>
  gazette_id: string
  id: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface IGazetteSection {
  section: ISection
  digests: IDigest[]
}
