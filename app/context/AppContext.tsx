/* eslint-disable @typescript-eslint/no-explicit-any */
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { useAuth0, User } from '@auth0/auth0-react'
import { useNavigate } from '@remix-run/react'
import React, { useEffect, useState } from 'react'

export interface IContextProps {
  user: User | null
  token: string | null
  isLoading: boolean
}

const AppContext = React.createContext<IContextProps>({
  token: null,
  user: null,
  isLoading: true,
})

interface IProviderProps {
  children: React.ReactNode
}

export function AppProvider({ children }: IProviderProps) {
  const { isAuthenticated, isLoading, user, getAccessTokenSilently } = useAuth0()
  const navigate = useNavigate()
  const [token, setToken] = useState<string>('')
  const handleApiError = useHandleApiError()
  const [loadingAuth0, setLoadingAuth0] = useState<boolean>(true)

  const fetchToken = async () => {
    try {
      const token = await getAccessTokenSilently()
      setToken(token)
    } catch (error: any) {
      handleApiError!(error?.message || 'Error when get token')
    } finally {
      setLoadingAuth0(false)
    }
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/', { replace: true })
      return
    } else if (isAuthenticated) {
      fetchToken()
    }
  }, [isLoading])

  const contextPayload = React.useMemo(
    () => ({
      token: token || '',
      user: user || null,
      isLoading: loadingAuth0,
    }),
    [user, token],
  )

  return <AppContext.Provider value={contextPayload}>{children}</AppContext.Provider>
}

export const useApp = (): IContextProps => {
  const context = React.useContext(AppContext)

  if (!context) {
    throw new Error('useCoreUI must be used within an IdentiesProvider')
  }

  return context
}
