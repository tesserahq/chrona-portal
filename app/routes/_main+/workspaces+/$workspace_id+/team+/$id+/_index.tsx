/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchApi } from '@/libraries/fetch'
import { IMembership } from '@/types/invitation'
import { useAuth0 } from '@auth0/auth0-react'
import { useLoaderData, useParams } from '@remix-run/react'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function WorkspaceTeamDetail() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { getAccessTokenSilently } = useAuth0()
  const params = useParams()
  const [member, setMember] = useState<IMembership>()
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const fetchInvitation = async () => {
    setIsLoading(true)

    try {
      const token = await getAccessTokenSilently()
      const response = await fetchApi(
        `${apiUrl}/memberships/${params.id}`,
        token,
        nodeEnv,
      )

      setMember(response)
    } catch (error: any) {
      const convertError = JSON.parse(error?.message)
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
              <dt className="d-label">Name</dt>
              <dd className="d-content space-x-2">{`${member?.user?.first_name} ${member?.user?.last_name}`}</dd>
            </div>
            <div className="d-item">
              <dt className="d-label">Role</dt>
              <dd className="d-content">
                <Badge variant="outline" className="capitalize">
                  {member?.role}
                </Badge>
              </dd>
            </div>
            <div className="d-item">
              <dt className="d-label">Created At</dt>
              <dd className="d-content">{format(member?.created_at || '', 'PPpp')}</dd>
            </div>
            <div className="d-item">
              <dt className="d-label">Invited by</dt>
              <dd className="d-content">{`${member?.created_by.first_name} ${member?.created_by.last_name}`}</dd>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
