import * as React from 'react'
import { LogOut, Monitor, Moon, Sun, UserCog } from 'lucide-react'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/utils/misc'
import { useNavigate } from '@remix-run/react'
import { useApp } from '@/context/AppContext'

interface Props {
  selectedTheme: string
  onSetTheme: (theme: string) => void
  menus?: { label: string; icon: React.ReactNode; onClick: () => void }[]
}

export function ProfileMenu({ selectedTheme, onSetTheme, menus }: Props) {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)
  const [loaded, setLoaded] = React.useState(false)
  const { user, isLoading } = useApp()
  const navigate = useNavigate()

  const onUpdateTheme = async (value: string) => {
    onSetTheme(value)
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="relative flex size-10 shrink-0 overflow-hidden rounded-full ring-1 ring-slate-300">
        <img src="/images/default-avatar.jpg" alt="default-avatar" />
      </div>
    )
  }

  if (user)
    return (
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild className="cursor-pointer">
          <div className="relative">
            <Avatar>
              <AvatarImage
                className={cn(
                  'transition-all duration-500',
                  loaded ? 'opacity-100' : 'opacity-0',
                )}
                src={user.picture || '/images/default-avatar.jpg'}
                loading="lazy"
                alt="test"
                onLoad={() => setTimeout(() => setLoaded(true), 1000)}
              />
            </Avatar>
            {!loaded && (
              <div className="absolute top-0 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
              </div>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="flex w-[16rem] flex-col px-5 py-5"
          side="bottom"
          align="end">
          <div className="mb-3 flex flex-row justify-start gap-x-3">
            <Avatar>
              <AvatarImage src={user?.picture || '/images/default-avatar.jpg'} />
            </Avatar>
            <div className="flex flex-col justify-center">
              {user && (
                <h1 className="max-w-40 truncate font-semibold">{`${user?.name}`}</h1>
              )}
              <p className="max-w-40 truncate text-sm text-accent-foreground">
                {user?.email}
              </p>
            </div>
          </div>
          <div className="mb-3 flex flex-row items-center gap-4">
            <span>Theme</span>
            <Select value={selectedTheme} onValueChange={onUpdateTheme}>
              <SelectTrigger className="h-9 w-full items-center justify-between rounded border text-sm">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent className="max-h-48 overflow-y-auto rounded-md border shadow-md">
                <div className="p-2">
                  <SelectItem
                    value={'dark'}
                    className="cursor-pointer rounded px-2 py-1 hover:bg-gray-100">
                    <div className="flex flex-row items-center gap-2">
                      <Moon size={15} />
                      <span>Dark</span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value={'light'}
                    className="cursor-pointer rounded px-2 py-1 hover:bg-gray-100">
                    <div className="flex flex-row items-center gap-2">
                      <Sun size={15} />
                      <span>Light</span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value={'system'}
                    className="cursor-pointer rounded px-2 py-1 hover:bg-gray-100">
                    <div className="flex flex-row items-center gap-2">
                      <Monitor size={15} />
                      <span>System</span>
                    </div>
                  </SelectItem>
                </div>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <div className="border-y py-1">
              <button
                className="flex w-full flex-row items-center gap-2 rounded-sm px-3 py-2 hover:bg-muted"
                onClick={() => {}}>
                <UserCog size={16} />
                <span>Your Profile</span>
              </button>
            </div>
            {menus?.length !== 0 &&
              menus?.map((menu) => {
                return (
                  <div key={menu.label} className="border-b pb-1">
                    <button
                      className="flex w-full flex-row items-center gap-2 rounded-sm px-3 py-2 hover:bg-muted"
                      onClick={menu.onClick}>
                      {menu.icon}
                      <span>{menu.label}</span>
                    </button>
                  </div>
                )
              })}
            <button
              className="flex w-full flex-row items-center gap-2 rounded-sm px-3 py-2 transition-all duration-200 hover:bg-destructive hover:text-white"
              onClick={() => navigate('/logout', { replace: true })}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    )
}
