/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import ModalDelete from '@/components/misc/DeleteConfirmation'
import MembershipAccess from '@/components/misc/Dialog/MembershipAccess'
import EmptyContent from '@/components/misc/EmptyContent'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import Separator from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { IMembership, Invitation } from '@/types/invitation'
import { IWorkspace } from '@/types/workspace'
import { redirectWithToast } from '@/utils/toast.server'
import { ActionFunctionArgs } from '@remix-run/node'
import {
  Link,
  useActionData,
  useLoaderData,
  useNavigate,
  useParams,
} from '@remix-run/react'
import { format } from 'date-fns'
import { EllipsisVertical, Eye, Pencil, Send, ShieldAlert, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function TeamWorkspaces() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const { token, user } = useApp()
  const handleApiError = useHandleApiError()
  const [isLoadingInvitation, setIsLoadingInvitation] = useState<boolean>(true)
  const [isLoadingMember, setIsLoadingMember] = useState<boolean>(true)
  const [isResendInvitation, setIsResendInvitation] = useState<boolean>(false)
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [memberships, setMemberships] = useState<IMembership[]>([])
  const [invitationDelete, setInvitationDelete] = useState<Invitation>()
  const [memberDelete, setMemberDelete] = useState<IMembership>()
  const params = useParams()
  const navigate = useNavigate()
  const deleteInvitationRef = useRef<React.ElementRef<typeof ModalDelete>>(null)
  const deleteMemberRef = useRef<React.ElementRef<typeof ModalDelete>>(null)
  const membershipAccessRef = useRef<React.ElementRef<typeof MembershipAccess>>(null)
  const [workspace, setWorkspace] = useState<IWorkspace>()
  const [userRole, setUserRole] = useState<{ role: string; id: string; email: string }>() // state to see who is you in team

  // fetch workspace to check created_by_id
  const fetchWorkspace = async () => {
    try {
      const response = await fetchApi(
        `${apiUrl}/workspaces/${params.workspace_id}`,
        token!,
        nodeEnv,
      )

      setWorkspace(response)
    } catch (error: any) {
      handleApiError(error)
    }
  }

  const fetchInvitations = async () => {
    setIsLoadingInvitation(true)

    try {
      const response = await fetchApi(
        `${apiUrl}/workspaces/${params.workspace_id}/invitations`,
        token!,
        nodeEnv,
      )

      setInvitations(response || [])
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoadingInvitation(false)
    }
  }

  const fetchMemberships = async () => {
    setIsLoadingMember(true)

    try {
      const response = await fetchApi(
        `${apiUrl}/workspaces/${params.workspace_id}/memberships`,
        token!,
        nodeEnv,
      )

      // const user = await fetchApi(`${identiesUrl}/user`, token, nodeEnv)
      const findUser = response.data.find((val: any) => val.user.email === user?.email) // to get logged role user

      setUserRole({ id: findUser.id, role: findUser.role, email: findUser.user.email })
      setMemberships(response.data)
    } catch (error: any) {
      const convertError = JSON.parse(error?.message)

      toast.error(`${convertError.status} - ${convertError.error}`)
    } finally {
      setIsLoadingMember(false)
    }
  }

  const resendInvitation = async (invitationID: string) => {
    setIsResendInvitation(true)

    try {
      const endpoint = `${apiUrl}/invitations/${invitationID}/resend`
      await fetchApi(endpoint, token!, nodeEnv, {
        method: 'POST',
      })

      toast.success('Successfully resend invitation')
      fetchInvitations()
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsResendInvitation(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchWorkspace()
      fetchInvitations()
      fetchMemberships()
    }
  }, [token])

  useEffect(() => {
    if (actionData?.success) {
      // show success message
      toast.success(actionData.message)
      // close modal
      deleteInvitationRef?.current?.onClose()
    }

    fetchMemberships()
    fetchInvitations()
  }, [actionData])

  if (isLoadingInvitation || isLoadingMember) {
    return <AppPreloader />
  }

  return (
    <div className="h-full">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-foreground">Team</h1>
        <Button onClick={() => navigate('new')}>Invite Member</Button>
      </div>

      {/* Memberships Section */}
      {memberships.length === 0 && (
        <EmptyContent
          image="/images/empty-invitation.png"
          title="No members yet? Let’s send some."
          description="Invite new members to join your workspace and start collaborating right away.">
          <Button variant="black" onClick={() => navigate('new')}>
            Invite Member
          </Button>
        </EmptyContent>
      )}
      {memberships.map((member) => {
        return (
          <Card key={member.id} className="mb-2 shadow-card">
            <CardContent className="flex items-center gap-2 pt-4">
              <Avatar>
                <AvatarImage src={member.user.avatar_url || ''} />
              </Avatar>
              <div className="flex-1">
                <Link
                  to={member.id}
                  className="mb-1 text-base font-medium text-black hover:text-primary hover:underline dark:text-primary-foreground">
                  {member.user.first_name} {member.user.last_name}
                </Link>
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                  <span className="capitalize">{member.role.split('_').join(' ')}</span>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <span>Created at {format(member.created_at!, 'dd MMM yyyy')}</span>
                  {userRole?.email === member.user.email && (
                    <>
                      <Separator orientation="vertical" className="mx-2 h-4" />
                      <Badge variant="outline">You</Badge>
                    </>
                  )}
                </div>
              </div>
              {workspace?.created_by_id !== member.user_id && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <EllipsisVertical />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-48 p-2">
                    {/* userRole?.role !== 'collaborator' &&
                      userRole?.role !== 'project_member' */}
                    {!['collaborator', 'project_member'].includes(
                      userRole?.role || '',
                    ) && (
                      <Button
                        variant="ghost"
                        className="flex w-full justify-start"
                        onClick={() => membershipAccessRef.current?.onOpen(member)}>
                        <ShieldAlert />
                        <span>Manage Access</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className="group flex w-full justify-start hover:bg-red-500"
                      // disabled={userRole?.email === member.user.email}
                      onClick={() => {
                        deleteMemberRef.current?.onOpen()
                        setMemberDelete(member)
                      }}>
                      <Trash2 className="group-hover:text-white" />
                      <span className="group-hover:text-white">Remove</span>
                    </Button>
                  </PopoverContent>
                </Popover>
              )}
            </CardContent>
          </Card>
        )
      })}

      {/* Invitations Section */}
      {invitations.length > 0 && (
        <>
          <h1 className="mb-5 mt-7 text-xl font-bold dark:text-foreground">
            Invitations
          </h1>
          {invitations.map((invitation) => {
            return (
              <Card key={invitation.id} className="mb-2.5 shadow-card">
                <CardContent className="flex items-center gap-2 pt-4">
                  <div className="flex-1">
                    <Link
                      to={`${invitation.id}/invitation`}
                      className="mb-1 text-base font-medium text-black hover:text-primary hover:underline dark:text-primary-foreground">
                      {invitation.email}
                    </Link>
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                      <span className="capitalize">{invitation.role}</span>
                      <Separator orientation="vertical" className="mx-2 h-4" />
                      <span>
                        Created at {format(invitation.created_at!, 'dd MMM yyyy')}
                      </span>
                      <Separator orientation="vertical" className="mx-2 h-4" />
                      {invitation.expires_at &&
                      new Date(invitation.expires_at) > new Date() ? (
                        <Badge
                          variant="outline"
                          className="border border-orange-400 text-orange-400">
                          Invited
                        </Badge>
                      ) : (
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge
                                variant="outline"
                                className="border border-destructive text-destructive">
                                <span className="!text-xs">Expired</span>
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent align="center" side="right">
                              <div className="p-1">
                                <span>
                                  Expired at {format(invitation.expires_at, 'PPpp')}
                                </span>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <EllipsisVertical />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-48 p-2">
                      <Button
                        variant="ghost"
                        className="flex w-full justify-start"
                        onClick={() => navigate(`${invitation.id}/invitation`)}>
                        <Eye />
                        <span>View</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="flex w-full justify-start"
                        onClick={() => navigate(`${invitation.id}/invitation/update`)}>
                        <Pencil />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        disabled={isResendInvitation}
                        onClick={() => resendInvitation(invitation.id)}>
                        <Send />
                        <span>
                          {isResendInvitation ? 'Sending...' : 'Resend Invitation'}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="group flex w-full justify-start hover:bg-red-500"
                        disabled={isResendInvitation}
                        onClick={() => {
                          deleteInvitationRef.current?.onOpen()
                          setInvitationDelete(invitation)
                        }}>
                        <Trash2 className="group-hover:text-white" />
                        <span className="group-hover:text-white">Delete</span>
                      </Button>
                    </PopoverContent>
                  </Popover>
                </CardContent>
              </Card>
            )
          })}
        </>
      )}

      <ModalDelete
        ref={deleteInvitationRef}
        alert="Invitation"
        title={`Remove "${invitationDelete?.email}" from invitation?`}
        data={{
          workspace_id: params.workspace_id,
          invitation_id: invitationDelete?.id,
          token: token,
          email: invitationDelete?.email,
          type: 'invitation',
        }}
      />

      <ModalDelete
        ref={deleteMemberRef}
        alert="Membership"
        title={`Remove "${memberDelete?.user.first_name} ${memberDelete?.user.last_name}" from membership?`}
        data={{
          workspace_id: params.workspace_id,
          membership_id: memberDelete?.id,
          token: token,
          email: invitationDelete?.email,
          type: 'member',
        }}
      />

      <MembershipAccess
        ref={membershipAccessRef}
        apiUrl={apiUrl!}
        token={token!}
        nodeEnv={nodeEnv}
        callback={() => fetchMemberships()}
      />
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const formData = await request.formData()
  const { workspace_id, invitation_id, membership_id, token, email, type } =
    Object.fromEntries(formData)

  try {
    if (request.method === 'DELETE') {
      if (type === 'invitation') {
        await fetchApi(
          `${apiUrl}/invitations/${invitation_id}`,
          token.toString(),
          nodeEnv,
          {
            method: 'DELETE',
          },
        )

        return { success: true, message: `Invitation ${email} deleted successfully` }
      }

      if (type === 'member') {
        await fetchApi(
          `${apiUrl}/memberships/${membership_id}`,
          token.toString(),
          nodeEnv,
          {
            method: 'DELETE',
          },
        )

        return { success: true, message: `Membership deleted successfully` }
      }
    }
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(`/workspaces/${workspace_id}/team`, {
      type: 'error',
      title: 'Error',
      description: `${convertError.status} - ${convertError.error}`,
    })
  }
}
