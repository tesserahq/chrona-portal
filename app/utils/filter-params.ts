/**
 * Utility functions for converting filter objects to/from query parameters
 */

export interface EntryFilterParams {
  tags?: string[]
  source_created_at?: {
    from: string | null
    to: string | null
  }
  source_updated_at?: {
    from: string | null
    to: string | null
  }
}

/**
 * Convert filter object to query string
 * @param filters - The filter object to convert
 * @returns Query string (without leading '?')
 */
export const filterToQueryParams = (filters: EntryFilterParams): string => {
  const params: string[] = []

  // Handle tags array
  if (filters.tags && filters.tags.length > 0) {
    filters.tags.forEach((tag) => {
      params.push(`tags[]=${encodeURIComponent(tag)}`)
    })
  }

  // Handle source_created_at date range
  if (filters.source_created_at) {
    if (filters.source_created_at.from) {
      params.push(
        `source_created_at[from]=${encodeURIComponent(filters.source_created_at.from)}`,
      )
    }
    if (filters.source_created_at.to) {
      params.push(
        `source_created_at[to]=${encodeURIComponent(filters.source_created_at.to)}`,
      )
    }
  }

  // Handle source_updated_at date range
  if (filters.source_updated_at) {
    if (filters.source_updated_at.from) {
      params.push(
        `source_updated_at[from]=${encodeURIComponent(filters.source_updated_at.from)}`,
      )
    }
    if (filters.source_updated_at.to) {
      params.push(
        `source_updated_at[to]=${encodeURIComponent(filters.source_updated_at.to)}`,
      )
    }
  }

  return params.join('&')
}

/**
 * Convert query string to filter object
 * @param searchParams - URLSearchParams or query string
 * @returns Filter object
 */
export const queryParamsToFilter = (
  searchParams: URLSearchParams | string,
): EntryFilterParams => {
  const params =
    typeof searchParams === 'string' ? new URLSearchParams(searchParams) : searchParams

  const filters: EntryFilterParams = {}

  // Extract tags array
  const tags = params.getAll('tags[]')
  if (tags.length > 0) {
    filters.tags = tags
  }

  // Extract source_created_at date range
  const createdAtFrom = params.get('source_created_at[from]')
  const createdAtTo = params.get('source_created_at[to]')
  if (createdAtFrom || createdAtTo) {
    filters.source_created_at = {
      from: createdAtFrom || null,
      to: createdAtTo || null,
    }
  }

  // Extract source_updated_at date range
  const updatedAtFrom = params.get('source_updated_at[from]')
  const updatedAtTo = params.get('source_updated_at[to]')
  if (updatedAtFrom || updatedAtTo) {
    filters.source_updated_at = {
      from: updatedAtFrom || null,
      to: updatedAtTo || null,
    }
  }

  return filters
}
