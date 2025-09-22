/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import EmptyContent from '@/components/misc/EmptyContent'
import Header from '@/components/misc/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { fetchApi } from '@/libraries/fetch'
import { IWorkspace, IWorkspaceLogo } from '@/types/workspace'
import { Outlet, useLoaderData, useNavigate } from '@remix-run/react'
import { Gauge, LockKeyhole, Settings } from 'lucide-react'
import { useEffect, useState } from 'react'
import Avatar from 'boring-avatars'
import { cn } from '@/utils/misc'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { setQuoreWorkspaceID } from '@/libraries/storage'

export function loader() {
  const apiUrl = process.env.API_URL
  const hostUrl = process.env.HOST_URL
  const nodeEnv = process.env.NODE_ENV
  const identiesApiUrl = process.env.IDENTIES_API_URL
  const identiesHosturl = process.env.IDENTIES_HOST_URL

  return { apiUrl, hostUrl, nodeEnv, identiesApiUrl, identiesHosturl }
}

export default function Index() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [workspaces, setWorkspaces] = useState<IWorkspace[]>([])
  const { token } = useApp()
  const handleApiError = useHandleApiError()

  const getWorkspaces = async () => {
    try {
      const response = await fetchApi(`${apiUrl}/workspaces`, token!, nodeEnv)

      setWorkspaces(response.data)
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const onRedirect = (workspace: IWorkspace, path: string) => {
    setQuoreWorkspaceID(workspace.quore_workspace_id || '')
    navigate(`/workspaces/${workspace.id}/${path}`)
  }

  useEffect(() => {
    if (token) {
      getWorkspaces()
    }
  }, [token])

  return (
    <>
      <div className="is-header-blur px-10 lg:px-0">
        <Header apiUrl={apiUrl!} nodeEnv={nodeEnv} />
      </div>
      <div className="mt-[60px] h-full bg-background px-5 py-4 xl:pl-[62px] xl:pr-[75px]">
        <div className="mb-5 flex animate-slide-up items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold dark:text-foreground">Workspaces</h1>
            <span className="text-muted-foreground">Manage your workspaces</span>
          </div>

          <Button onClick={() => navigate('new')}>New Workspace</Button>
        </div>
        {isLoading && <AppPreloader className="lg:h-[600px]" />}
        {!isLoading && (
          <>
            {workspaces.length === 0 && (
              <EmptyContent
                image="/images/empty-workspace.png"
                title="No workspace yet? Let’s fix that."
                description="Create your first Chrona space and bring your AI ideas to life">
                <Button
                  variant="outline"
                  onClick={() => navigate('new')}
                  className="bg-black text-white dark:bg-secondary dark:text-secondary-foreground">
                  Start Creating
                </Button>
              </EmptyContent>
            )}
            <div className="grid h-auto animate-slide-up gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {workspaces.map((workspace) => {
                const logo: IWorkspaceLogo = JSON.parse(workspace.logo || '{}')

                // Create gradient from all logo colors (using all 5 colors)
                const gradientColors =
                  logo.colors && logo.colors.length >= 5
                    ? `linear-gradient(135deg, ${logo.colors[0]}2A, ${logo.colors[1]}2A, ${logo.colors[2]}2A, ${logo.colors[3]}2A, ${logo.colors[4]}2A)`
                    : 'linear-gradient(135deg, #49b9c71A, #2a9d8f1A, #e9c46a1A, #f4a2611A, #e76f511A)' // fallback gradient with 5 colors

                return (
                  <Card
                    key={workspace.id}
                    className={cn('w-full overflow-hidden shadow-card')}>
                    <CardContent
                      className="relative flex h-full flex-col"
                      style={{ background: gradientColors }}>
                      {workspace.locked && (
                        <LockKeyhole className="absolute right-3 top-3" />
                      )}
                      <div
                        className="flex h-52 cursor-pointer items-end justify-center"
                        onClick={() => onRedirect(workspace, 'overview')}>
                        <Avatar
                          size={180}
                          name={logo.name || 'Mary Baker'}
                          variant={(logo.variant as any) || 'abstract'}
                          colors={logo.colors}
                        />
                      </div>
                      <div className="flex flex-1 flex-col py-2">
                        <h3
                          className="line-clamp-3 w-full cursor-pointer pt-2 text-center text-base font-medium drop-shadow-sm"
                          onClick={() => onRedirect(workspace, 'overview')}>
                          {workspace.name}
                        </h3>
                        <p className="line-clamp-2 w-full text-center text-xs text-muted-foreground drop-shadow-sm">
                          {workspace.description}
                        </p>
                      </div>
                      <div className="mt-2 flex w-full items-center justify-between justify-self-end">
                        <div
                          className="group flex cursor-pointer items-center space-x-2"
                          onClick={() => onRedirect(workspace, 'projects')}>
                          <Gauge size={20} className="text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Projects</span>
                        </div>
                        <div
                          className="group flex cursor-pointer items-center space-x-2"
                          onClick={() => onRedirect(workspace, 'settings')}>
                          <Settings size={20} className="text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Settings</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </div>

      <Outlet />
    </>
  )
}
