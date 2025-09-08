/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { fetchApi } from '@/libraries/fetch'
import { Invitation } from '@/types/invitation'
import { useAuth0 } from '@auth0/auth0-react'
import { useLoaderData, useNavigate, useParams } from '@remix-run/react'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function WorkspaceInvitationDetail() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { getAccessTokenSilently } = useAuth0()
  const params = useParams()
  const navigate = useNavigate()
  const [invitation, setInvitation] = useState<Invitation>()
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const fetchInvitation = async () => {
    try {
      const token = await getAccessTokenSilently()
      const response = await fetchApi(
        `${apiUrl}/invitations/${params.id}`,
        token,
        nodeEnv,
      )

      setInvitation(response)
    } catch (error: any) {
      const convertError = JSON.parse(error?.message)

      if (convertError.status === 401) {
        navigate('/logout')
      }

      toast.error(`${convertError.status} - ${convertError.error}`)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    fetchInvitation()
  }, [])

  if (isLoading) return <AppPreloader />

  return (
    <div className="coreui-content-center">
      <Card className="coreui-card-center">
        <CardHeader>
          <CardTitle>Invitation Detail</CardTitle>
        </CardHeader>
        <CardContent className="px-6">
          <div className="d-list">
            <div className="d-item">
              <dt className="d-label">Email</dt>
              <dd className="d-content space-x-2">{invitation?.email}</dd>
            </div>
            <div className="d-item">
              <dt className="d-label">Role</dt>
              <dd className="d-content">
                <Badge variant="outline" className="capitalize">
                  {invitation?.role}
                </Badge>
              </dd>
            </div>
            <div className="d-item">
              <dt className="d-label">Status</dt>
              <dd className="d-content">
                {invitation?.expires_at &&
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
                            Expired at {format(invitation?.expires_at || '', 'PPpp')}
                          </span>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </dd>
            </div>
            <div className="d-item">
              <dt className="d-label">Created At</dt>
              <dd className="d-content">
                {format(invitation?.created_at || '', 'PPpp')}
              </dd>
            </div>
            {invitation?.message && (
              <div className="d-item">
                <dt className="d-label">Message</dt>
                <dd className="d-content">{invitation?.message}</dd>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="mt-5 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/workspaces/${params.workspace_id}/team`)}>
            Back
          </Button>
          <Button onClick={() => navigate('update')}>Edit</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
