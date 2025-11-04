/**
 * Utility functions for converting filter objects to/from query parameters
 */

export interface EntryFilterParams {
  tags?: string[]
  created_at?: {
    from: string | null
    to: string | null
  }
  updated_at?: {
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

  // Handle created_at date range
  if (filters.created_at) {
    if (filters.created_at.from) {
      params.push(`created_at[from]=${encodeURIComponent(filters.created_at.from)}`)
    }
    if (filters.created_at.to) {
      params.push(`created_at[to]=${encodeURIComponent(filters.created_at.to)}`)
    }
  }

  // Handle updated_at date range
  if (filters.updated_at) {
    if (filters.updated_at.from) {
      params.push(`updated_at[from]=${encodeURIComponent(filters.updated_at.from)}`)
    }
    if (filters.updated_at.to) {
      params.push(`updated_at[to]=${encodeURIComponent(filters.updated_at.to)}`)
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

  // Extract created_at date range
  const createdAtFrom = params.get('created_at[from]')
  const createdAtTo = params.get('created_at[to]')
  if (createdAtFrom || createdAtTo) {
    filters.created_at = {
      from: createdAtFrom || null,
      to: createdAtTo || null,
    }
  }

  // Extract updated_at date range
  const updatedAtFrom = params.get('updated_at[from]')
  const updatedAtTo = params.get('updated_at[to]')
  if (updatedAtFrom || updatedAtTo) {
    filters.updated_at = {
      from: updatedAtFrom || null,
      to: updatedAtTo || null,
    }
  }

  return filters
}
