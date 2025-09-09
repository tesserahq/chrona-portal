/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button'
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { fetchApi, NodeENVType } from '@/libraries/fetch'
import { IMembership } from '@/types/invitation'
import { cn } from '@/utils/misc'
import { FileUser, ShieldUser, UserCog2, Users2 } from 'lucide-react'
import { forwardRef, useImperativeHandle, useState } from 'react'
import { toast } from 'sonner'
import { AppPreloader } from '../AppPreloader'

export interface IMembershipRole {
  id: string
  name: string
}

interface FuncProps {
  onOpen: (member: IMembership) => void
}

interface IProps {
  apiUrl: string
  token: string
  nodeEnv: NodeENVType
  callback: () => void
}

const MembershipAccessDialog: React.ForwardRefRenderFunction<FuncProps, IProps> = (
  { apiUrl, token, nodeEnv, callback },
  ref,
) => {
  const [open, setOpen] = useState<boolean>(false)
  const [roles, setRoles] = useState<IMembershipRole[]>([])
  const [member, setMember] = useState<IMembership>()
  const [selectedRole, setSelectedRole] = useState<IMembershipRole>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLoadingUpdate, setIsLoadingUpdate] = useState<boolean>(false)

  const fetchRoles = async () => {
    try {
      const response = await fetchApi(`${apiUrl}/memberships/roles`, token, nodeEnv)

      setRoles(response.roles)
    } catch (error: any) {
      const convertError = JSON.parse(error?.message)

      toast.error(`${convertError.status} - ${convertError.error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const onUpdateRole = async () => {
    setIsLoadingUpdate(true)

    try {
      await fetchApi(`${apiUrl}/memberships/${member?.id}`, token, nodeEnv, {
        method: 'PUT',
        body: JSON.stringify({ role: selectedRole?.id }),
      })

      toast.success(
        `Successfully update role for ${member?.user.first_name} ${member?.user.last_name}`,
      )

      setOpen(false)
      callback()
    } catch (error: any) {
      const convertError = JSON.parse(error?.message)

      toast.error(`${convertError.status} - ${convertError.error}`)
    } finally {
      setIsLoadingUpdate(false)
    }
  }

  const onClose = () => {
    setOpen(false)
    // setIsLoading(false)
    setIsLoadingUpdate(false)
    setSelectedRole(undefined)
  }

  useImperativeHandle(ref, () => ({
    onOpen(member) {
      setOpen(true)
      setIsLoading(true)
      fetchRoles()
      setMember(member)
      setSelectedRole({
        id: member.role === 'admin' ? 'administrator' : member.role,
        name: member.role,
      })
    },
  }))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-popover">
        <DialogHeader>
          <DialogTitle>Manage Access</DialogTitle>
          <DialogDescription>
            Choose the appropriate access level for user{' '}
            <b>{`${member?.user.first_name} ${member?.user.last_name}`}</b>
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <AppPreloader className="bg-popover dark:bg-popover" />
        ) : (
          <Command className="animate animate-slide-up">
            <CommandList>
              <CommandGroup>
                {roles.map((role) => {
                  return (
                    <CommandItem
                      key={role.id}
                      value={role.id}
                      onSelect={(value: string) => {
                        const findRole = roles.find((val) => val.id === value)
                        setSelectedRole(findRole)
                      }}
                      className={cn(
                        'my-2 flex cursor-pointer items-start gap-4 rounded-lg border-2 p-4 transition-all',
                        selectedRole?.id === role.id && 'border-primary bg-accent',
                      )}>
                      <div className="flex items-center gap-2 font-medium">
                        <>
                          {role.id === 'owner' && <ShieldUser />}
                          {role.id === 'administrator' && <UserCog2 />}
                          {role.id === 'collaborator' && <Users2 />}
                          {role.id === 'project_member' && <FileUser />}
                        </>
                        {role.name}
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
        <DialogFooter className="flex justify-end">
          <Button disabled={isLoadingUpdate} variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button disabled={isLoadingUpdate || !selectedRole} onClick={onUpdateRole}>
            {isLoadingUpdate ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default forwardRef(MembershipAccessDialog)
