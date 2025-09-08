/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProfileMenu } from '@/components/misc/ProfileMenu'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import Separator from '@/components/ui/separator'
import { useRequestInfo } from '@/hooks/useRequestInfo'
import { NodeENVType } from '@/libraries/fetch'
import { ROUTE_PATH as THEME_PATH } from '@/routes/resources+/update-theme'
import { cn } from '@/utils/misc'
import { Link, useSubmit } from '@remix-run/react'
import { Settings } from 'lucide-react'
import { useRef } from 'react'
import DialogSystemSettings from './Dialog/SystemSettings'
import MenuToggle from './MenuToggle'

interface IHeaderProps {
  apiUrl: string
  nodeEnv: NodeENVType
  action?: React.ReactNode
  withSidebar?: boolean
  isExpanded?: boolean
  setIsExpanded?: (isExpanded: boolean) => void
  hostUrl?: string
}

export default function Header({
  isExpanded,
  setIsExpanded,
  action,
  withSidebar,
  apiUrl,
  nodeEnv,
}: IHeaderProps) {
  const requestInfo = useRequestInfo()
  const submit = useSubmit()
  const dialogSettingRef = useRef<React.ElementRef<typeof DialogSystemSettings>>(null)
  const onSetTheme = (theme: string) => {
    submit(
      { theme },
      {
        method: 'POST',
        action: THEME_PATH,
        navigate: false,
        fetcherKey: 'theme-fetcher',
      },
    )
  }

  // const apps = [
  //   {
  //     name: 'custos',
  //     link: 'https://custos.estate-buddy.com?autologin=true',
  //   },
  //   {
  //     name: 'vaulta',
  //     link: 'https://vaulta.estate-buddy.com?autologin=true',
  //   },
  //   {
  //     name: 'identies',
  //     link: 'https://identies.estate-buddy.com?autologin=true',
  //   },
  // ]

  return (
    <>
      <nav className="header animate-slide-down print:hidden">
        <div className="header-container relative flex w-full print:hidden">
          <div
            className={cn(
              'flex w-full items-center justify-between space-x-5',
              !withSidebar && 'xl:mx-10',
            )}>
            {/* Left content */}
            <div className="flex items-center gap-2">
              <Link to="/" className="mr-2">
                <div className="flex items-center gap-2 lg:ml-0">
                  <Avatar className="avatar-hover">
                    <AvatarImage src="/images/logo.png" />
                  </Avatar>
                  <span className="text-base font-bold">Chrona</span>
                </div>
              </Link>
              {withSidebar && <MenuToggle onClick={() => setIsExpanded!(!isExpanded)} />}

              {action && (
                <Separator
                  orientation="vertical"
                  className="mr-1.5 h-3 bg-slate-400 dark:bg-slate-500"
                />
              )}
              {action}
            </div>

            {/* Right content */}
            <div className="flex items-center space-x-1 lg:space-x-5">
              <ProfileMenu
                selectedTheme={requestInfo.userPrefs.theme || 'system'}
                onSetTheme={(theme) => onSetTheme(theme)}
                menus={[
                  {
                    label: 'System Settings',
                    icon: <Settings size={16} />,
                    onClick: () => dialogSettingRef.current?.onOpen(),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </nav>

      <DialogSystemSettings ref={dialogSettingRef} apiUrl={apiUrl} nodeEnv={nodeEnv} />
    </>
  )
}
