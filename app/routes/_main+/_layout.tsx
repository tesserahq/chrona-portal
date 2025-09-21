/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import Header from '@/components/misc/Header'
import ProjectShortcut from '@/components/misc/ProjectShortcut'
import SidebarPanel, { IMenuItemProps } from '@/components/misc/Sidebar/SidebarPanel'
import SidebarPanelMin from '@/components/misc/Sidebar/SidebarPanelMin'
import WorkspaceShortcut from '@/components/misc/WorkspaceShortcut'
import { AppProvider } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { setProjectID, setWorkspaceID } from '@/libraries/storage'
import '@/styles/customs/sidebar.css'
import { cn } from '@/utils/misc'
import { useAuth0 } from '@auth0/auth0-react'
import { Outlet, useLoaderData, useNavigate, useParams } from '@remix-run/react'
import {
  ChevronRight,
  ClipboardCheck,
  Cog,
  Database,
  File,
  FileChartLine,
  MonitorDown,
  Newspaper,
  Settings,
  UserLock,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

export function loader() {
  const hostUrl = process.env.HOST_URL
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { hostUrl, apiUrl, nodeEnv }
}

export default function Layout() {
  const { hostUrl, apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const params = useParams()
  const [isExpanded, setIsExpanded] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { getAccessTokenSilently } = useAuth0()
  const handleApiError = useHandleApiError()
  const [isLoadingInvitation, setIsLoadingInvitation] = useState<boolean>(true)

  const projectItems: IMenuItemProps[] = [
    // {
    //   title: 'Overview',
    //   path: `/projects/${params.project_id}/overview`,
    //   icon: <FileChartLine size={18} />,
    // },
    // {
    //   title: 'Assistant',
    //   path: `/projects/${params.project_id}/assistant`,
    //   icon: <Bot size={18} />,
    // },
    {
      title: 'Entries',
      path: `/projects/${params.project_id}/entries`,
      icon: <File size={18} />,
    },
    {
      title: 'Digests',
      path: `/projects/${params.project_id}/digests`,
      icon: <ClipboardCheck size={18} />,
    },
    {
      title: 'Digest Generator',
      path: `/projects/${params.project_id}/digest-generator`,
      icon: <Cog size={18} />,
    },
    {
      title: 'Import Requests',
      path: `/projects/${params.project_id}/import-requests`,
      icon: <MonitorDown size={18} />,
    },
    {
      title: 'Gazettes',
      path: `/projects/${params.project_id}/gazettes`,
      icon: <Newspaper size={18} />,
    },
    {
      title: 'Members',
      path: `/projects/${params.project_id}/members`,
      icon: <Users size={18} />,
    },
    {
      title: 'Settings',
      path: `/projects/${params.project_id}/settings`,
      icon: <Settings size={18} />,
    },
  ]

  const workspaceItems: IMenuItemProps[] = [
    {
      title: 'Overview',
      path: `/workspaces/${params.workspace_id}/overview`,
      icon: <FileChartLine size={18} />,
    },
    {
      title: 'Projects',
      path: `/workspaces/${params.workspace_id}/projects`,
      icon: <File size={18} />,
    },
    {
      title: 'Authors',
      path: `/workspaces/${params.workspace_id}/authors`,
      icon: <UserLock size={18} />,
    },
    {
      title: 'Sources',
      path: `/workspaces/${params.workspace_id}/sources`,
      icon: <Database size={18} />,
    },
    {
      title: 'Team',
      path: `/workspaces/${params.workspace_id}/team`,
      icon: <Users size={18} />,
    },
    {
      title: 'Settings',
      path: `/workspaces/${params.workspace_id}/settings`,
      icon: <Settings size={18} />,
    },
  ]

  const onResize = useCallback(() => {
    if (containerRef.current) {
      if (containerRef.current.offsetWidth <= 1280) {
        setIsExpanded(false)
      }
    }
  }, [])

  const fetchInvitation = async () => {
    try {
      const token = await getAccessTokenSilently()
      // Get all valid invitations for the current user.
      const response = await fetchApi(`${apiUrl}/invitations`, token!, nodeEnv)

      if (response.length) {
        navigate('/invitations')
      }
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoadingInvitation(false)
    }
  }

  useEffect(() => {
    onResize()

    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [onResize])

  useEffect(() => {
    fetchInvitation()
  }, [])

  useEffect(() => {
    if (params.workspace_id) setWorkspaceID(params.workspace_id)
    if (params.project_id) setProjectID(params.project_id)
  }, [params.workspace_id, params.project_id])

  if (isLoadingInvitation) {
    // Display loading screen when auth0 isLoading true
    return <AppPreloader className="min-h-screen" />
  }

  return (
    <AppProvider>
      {params.workspace_id || params.project_id ? (
        <div
          ref={containerRef}
          className={cn(
            'has-min-sidebar is-header-blur',
            isExpanded && 'is-sidebar-open',
          )}>
          <div id="root" className="min-h-100vh flex grow">
            <div className="sidebar print:hidden">
              <SidebarPanel
                menuItems={params.workspace_id ? workspaceItems : projectItems}
              />
              <SidebarPanelMin
                menuItems={params.workspace_id ? workspaceItems : projectItems}
              />
            </div>

            <Header
              withSidebar
              apiUrl={apiUrl!}
              nodeEnv={nodeEnv}
              action={
                // show shortcut to choose current workspace or project
                params.workspace_id || params.project_id ? (
                  <>
                    <WorkspaceShortcut apiUrl={apiUrl!} nodeEnv={nodeEnv} />
                    {params.project_id && (
                      <>
                        <ChevronRight
                          size={15}
                          className="mr-2 text-slate-400 dark:text-slate-500"
                        />
                        <ProjectShortcut apiUrl={apiUrl!} nodeEnv={nodeEnv} />
                      </>
                    )}
                  </>
                ) : null
              }
              hostUrl={hostUrl}
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
            />

            <main className="main-content w-full">
              <Outlet />
            </main>
          </div>
        </div>
      ) : (
        <Outlet />
      )}
    </AppProvider>
  )
}
