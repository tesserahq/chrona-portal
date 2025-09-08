import { AppPreloader } from '@/components/misc/AppPreloader'
import { Button } from '@/components/ui/button'
import { SITE_CONFIG } from '@/constants/brand'
import { useAuth0 } from '@auth0/auth0-react'
import type { MetaFunction } from '@remix-run/node'
import { Navigate, useSearchParams } from '@remix-run/react'
import { useEffect } from 'react'

export const meta: MetaFunction = () => {
  return [
    { title: `${SITE_CONFIG.siteTitle}` },
    { name: 'description', content: SITE_CONFIG.siteDescription },
  ]
}

export default function Index() {
  const { isAuthenticated, isLoading, error, loginWithRedirect } = useAuth0()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('autologin')) {
      loginWithRedirect()
    }
  }, [])

  if (error) {
    return <div>Oops... {error.message}</div>
  }

  if (isLoading) {
    return <AppPreloader className="h-screen" />
  }

  if (isAuthenticated) {
    return <Navigate to="/workspaces" />
  }

  return (
    <div className="flex h-screen w-full animate-slide-up flex-col items-center justify-center gap-10 bg-white dark:bg-background lg:flex-row">
      <img src="/images/login.png" alt="login" className="w-96 rounded-lg" />
      <div className="max-w-[400px] flex-col items-center lg:items-start">
        <h1 className="mt-3 text-3xl font-semibold dark:text-white">Welcome back!</h1>
        <p className="mt-1 text-base opacity-70 dark:text-primary-foreground">
          Log in to access Chrona and get a clear view of your projects without jumping
          between tools.
        </p>
        <div className="mt-5">
          <Button onClick={() => loginWithRedirect()}>Login</Button>
        </div>
      </div>
    </div>
  )
}
