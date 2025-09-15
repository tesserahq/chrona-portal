import { cn } from '@/utils/misc'
import { Link, useLocation } from '@remix-run/react'

interface ItemProps {
  title: string
  path: string
  icon: React.ReactNode
}
export interface IMenuItemProps {
  title: string
  path: string
  icon: React.ReactNode
  children?: ItemProps[]
  divider?: boolean
}

interface ISidebarPanelProps {
  menuItems: IMenuItemProps[]
}

export default function SidebarPanel({ menuItems }: ISidebarPanelProps) {
  const { pathname } = useLocation()

  const getActiveMenu = (menu: string) => {
    return pathname.includes(menu.split(' ').join('-').toLowerCase())
  }

  return (
    <div className="sidebar-panel bg-peat-50 flex h-full grow flex-col justify-between bg-white dark:bg-sidebar-background">
      <div className="flex w-full flex-col">
        {/* Sidebar Panel Body */}
        <div className="sidebar-body">
          <div className="is-scrollbar-hidden grow overflow-y-auto">
            <ul className="sidebar-nav mt-2">
              {menuItems.map((item) => (
                <div key={item.path}>
                  <li
                    className={cn(
                      'flex items-center justify-between overflow-hidden rounded hover:bg-slate-50 dark:hover:bg-background',
                      (pathname === item.path || getActiveMenu(item.title)) &&
                        'bg-accent hover:bg-accent',
                    )}>
                    <Link
                      to={item.path}
                      className={cn(
                        'w-full',
                        (pathname === item.path || getActiveMenu(item.title)) && 'active',
                      )}>
                      {item.icon}
                      {item.title}
                    </Link>
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
