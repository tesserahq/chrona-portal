/* eslint-disable @typescript-eslint/no-explicit-any */
import { CurlGenerator } from 'curl-generator'

export type NodeENVType = 'test' | 'development' | 'staging' | 'production'

// Custom error class for token expiration
export class TokenExpiredError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TokenExpiredError'
  }
}

// Custom error class for unauthorized access
export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export const fetchApi = async (
  endpoint: string,
  token: string,
  node_env: NodeENVType,
  options: RequestInit = {},
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const headers: any = { 'Content-Type': 'application/json' }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const config = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  }

  if (node_env === 'development') {
    const params: any = {
      url: endpoint,
      method: options.method || 'GET',
      ...config,
    }

    const curlSnippet = CurlGenerator(params)
    // eslint-disable-next-line no-console
    console.log(curlSnippet)
  }

  const response = await fetch(`${endpoint}`, config)

  // for anticipation error json.parse if response status is 204
  if (response.status === 204) {
    return { message: response.statusText }
  }

  const json = await response.json()

  if (response.status >= 400) {
    // Handle token expiration (401) and unauthorized access (403)
    if (response.status === 401) {
      throw new TokenExpiredError(
        JSON.stringify({
          status: response.status,
          error: json?.detail
            ? json.detail
            : json?.detail?.[0]?.msg || 'Token expired or invalid',
        }),
      )
    }

    if (response.status === 403) {
      throw new UnauthorizedError(
        JSON.stringify({
          status: response.status,
          error: json?.detail
            ? json.detail
            : json?.detail?.[0]?.msg || 'Unauthorized access',
        }),
      )
    }

    throw new Error(
      JSON.stringify({
        status: response.status,
        error: json?.detail
          ? json.detail
            ? json.detail
            : json?.detail[0]?.msg
          : response.statusText,
      }),
    )
  }

  return json
}
