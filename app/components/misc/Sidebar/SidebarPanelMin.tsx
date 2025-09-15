import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/utils/misc'
import { Link, useLocation } from '@remix-run/react'
import { IMenuItemProps } from './SidebarPanel'

interface ISidebarPanelProps {
  menuItems: IMenuItemProps[]
}

export default function SidebarPanelMin({ menuItems }: ISidebarPanelProps) {
  const { pathname } = useLocation()

  const getActiveMenu = (menu: string) => {
    return pathname.includes(menu.split(' ').join('-').toLowerCase())
  }

  return (
    <div className="sidebar-panel-min">
      <div className="flex h-full flex-col items-center bg-white dark:bg-sidebar-background">
        {/* Sidebar Panel Min Body */}
        <div className="flex h-[calc(100%-4.5rem)] grow flex-col">
          <div className="is-scrollbar-hidden">
            <ul className={cn('sidebar-nav mt-2 space-y-1')}>
              {menuItems.map((item) => (
                <div key={item.title}>
                  <li className="overflow-hidden rounded">
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            to={item.path}
                            className={cn(
                              '',
                              (pathname === item.path || getActiveMenu(item.title)) &&
                                'active',
                            )}>
                            {item.icon}
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">{item.title}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </li>

                  {item.divider && (
                    <hr className="my-2 border-t border-slate-200 dark:border-slate-700" />
                  )}
                </div>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
