import { TokenExpiredError, UnauthorizedError } from '@/libraries/fetch'
import { useNavigate } from '@remix-run/react'
import { useCallback } from 'react'
import { toast } from 'sonner'

export const useHandleApiError = () => {
  const navigate = useNavigate()

  const handleTokenExpiration = useCallback((error: unknown) => {
    if (error instanceof TokenExpiredError) {
      toast.error('Session expired. Please log in again.')
      // maybe need handle refresh token in here, for now let logout first
      // or if logged out user can back to current page after logged in
      navigate('/logout', { replace: true })
      return false
    }

    if (error instanceof UnauthorizedError) {
      toast.error('You are not authorized to perform this action.')
      navigate('/', { replace: true })
      return false
    }

    return false
  }, [])

  const handleApiError = useCallback(
    (error: unknown) => {
      try {
        const errorData = JSON.parse((error as Error).message)

        if (errorData.status === 401) {
          return handleTokenExpiration(new TokenExpiredError((error as Error).message))
        }

        if (errorData.status === 403) {
          return handleTokenExpiration(new UnauthorizedError((error as Error).message))
        }

        // For other errors, just show the error message
        toast.error(`${errorData.status} - ${errorData.error}`)
        return false
      } catch (parseError) {
        // If we can't parse the error, show the original error message
        toast.error((error as Error).message || 'An unexpected error occurred')
        return false
      }
    },
    [handleTokenExpiration],
  )

  return handleApiError
}
