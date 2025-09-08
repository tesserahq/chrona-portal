/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import EmptyContent from '@/components/misc/EmptyContent'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Separator from '@/components/ui/separator'
import { useApp } from '@/context/AppContext'
import { fetchApi } from '@/libraries/fetch'
import { Invitation } from '@/types/invitation'
import { useLoaderData, useNavigate } from '@remix-run/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const identiesApiUrl = process.env.IDENTIES_API_URL
  const identiesHosturl = process.env.IDENTIES_HOST_URL

  return { apiUrl, nodeEnv, identiesApiUrl, identiesHosturl }
}

export default function InvitationPage() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation>()
  const [isLoadingAccept, setIsLoadingAccept] = useState<boolean>(false)
  const [isLoadingDecline, setIsLoadingDecline] = useState<boolean>(false)
  const [isLoadingFetch, setIsLoadingFetch] = useState<boolean>(false)
  const navigate = useNavigate()
  const { token, isLoading: loadingAuth0 } = useApp()

  const fetchAllValidInvitations = async () => {
    setIsLoadingFetch(true)

    try {
      // Get all valid invitations for the current user.
      const response = await fetchApi(`${apiUrl}/invitations`, token!, nodeEnv)

      setInvitations(response)
    } catch (error: any) {
      const convertError = JSON.parse(error?.message)

      toast.error(`${convertError.status} - ${convertError.error}`)
    }

    setIsLoadingFetch(false)
  }

  const handleAccept = async (invitation: Invitation) => {
    setIsLoadingAccept(true)

    setSelectedInvitation(invitation)

    try {
      const response = await fetchApi(
        `${apiUrl}/invitations/${invitation!.id}/accept`,
        token!,
        nodeEnv,
        {
          method: 'POST',
        },
      )

      // auto redirect to selected workspace
      if (response) {
        navigate(`/workspaces/${invitation!.workspace.id}/overview`)
      }
    } catch (error: any) {
      const convertError = JSON.parse(error?.message)

      toast.error(`${convertError.status} - ${convertError.error}`)
    }

    setIsLoadingAccept(false)
    setSelectedInvitation(undefined)
  }

  const handleDecline = async (invitation: Invitation) => {
    setIsLoadingDecline(true)
    setSelectedInvitation(invitation)

    try {
      await fetchApi(`${apiUrl}/invitations/${invitation!.id}/decline`, token!, nodeEnv, {
        method: 'POST',
      })

      toast.success(`Successfully decline invitation`)
      fetchAllValidInvitations()
    } catch (error: any) {
      const convertError = JSON.parse(error?.message)

      toast.error(`${convertError.status} - ${convertError.error}`)
    }

    setIsLoadingDecline(false)
    setSelectedInvitation(undefined)
  }

  useEffect(() => {
    if (!loadingAuth0) {
      fetchAllValidInvitations()
    }
  }, [loadingAuth0])

  if (isLoadingFetch || loadingAuth0) {
    return (
      <div className="h-screen w-full">
        <AppPreloader />
      </div>
    )
  }

  return (
    <div className="flex h-screen items-center justify-center gap-5">
      {invitations.length === 0 && (
        <EmptyContent
          image="/images/empty-invitation.png"
          title="You have no invitations"
          description="There are currently no pending invitations for any workspace linked to your account.">
          <Button variant="black" onClick={() => navigate('/workspaces')}>
            Back to Workspace
          </Button>
        </EmptyContent>
      )}
      {invitations.map((invitation) => {
        return (
          <div key={invitation.id} className="flex flex-col items-center">
            <img
              src={invitation.workspace.logo || '/images/logo.png'}
              alt="logo"
              className="mx-a mb-5 mt-3 w-16"
            />
            <Card className="w-full max-w-md">
              <CardContent className="px-6 pt-7">
                <div className="flex flex-col items-center justify-center px-16">
                  <p className="mb-2 text-center text-sm text-secondary-foreground">
                    {`${invitation.inviter.first_name} ${invitation.inviter.last_name}`}{' '}
                    has invited you to join
                  </p>
                  <h1 className="mb-2 text-center text-2xl font-semibold">
                    &quot;{invitation.workspace.name}&quot; Workspace
                  </h1>
                </div>
                <Separator className="my-5" />
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDecline(invitation)}
                    disabled={
                      (isLoadingAccept || isLoadingDecline) &&
                      invitation.id === selectedInvitation?.id
                    }>
                    {isLoadingDecline && invitation.id === selectedInvitation?.id
                      ? 'Declining...'
                      : 'Decline'}
                  </Button>
                  <Button
                    onClick={() => handleAccept(invitation)}
                    disabled={
                      (isLoadingAccept || isLoadingDecline) &&
                      invitation.id === selectedInvitation?.id
                    }>
                    {isLoadingAccept && invitation.id === selectedInvitation?.id
                      ? 'Joining...'
                      : 'Join Workspace'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      })}
    </div>
  )
}
