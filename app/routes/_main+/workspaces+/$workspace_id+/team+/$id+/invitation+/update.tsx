/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { fetchApi } from '@/libraries/fetch'
import { invitationSchema } from '@/schemas/invitation'
import { Invitation } from '@/types/invitation'
import { cn } from '@/utils/misc'
import { redirectWithToast } from '@/utils/toast.server'
import { useAuth0 } from '@auth0/auth0-react'
import { ActionFunctionArgs } from '@remix-run/node'
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useParams,
} from '@remix-run/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function TeamUpdate() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const [role, setRole] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const [invitation, setInvitation] = useState<Invitation>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const actionData = useActionData<typeof action>()
  const navigate = useNavigate()
  const params = useParams()
  const navigation = useNavigation()
  const [errorFields, setErrorFields] = useState<any>()
  const { getAccessTokenSilently } = useAuth0()
  const roles = ['owner', 'collaborator', 'admin']

  const fetchInvitation = async () => {
    try {
      const token = await getAccessTokenSilently()
      const response = await fetchApi(
        `${apiUrl}/invitations/${params.id}`,
        token,
        nodeEnv,
      )

      setInvitation(response)
      setToken(token)
      setRole(response.role)
    } catch (error: any) {
      const convertError = JSON.parse(error?.message)

      if (convertError.status === 401) {
        navigate('/logout')
      }

      toast.error(`${convertError.status} - ${convertError.error}`)
    }

    setIsLoading(false)
  }

  const onRemoveError = (fieldName: string, value?: string) => {
    setErrorFields((prev: any) => ({
      ...prev,
      [fieldName]: value ? null : `${fieldName} is required`,
    }))
  }

  useEffect(() => {
    fetchInvitation()
  }, [])

  useEffect(() => {
    if (actionData?.errors) {
      setErrorFields(actionData.errors)
    }
  }, [actionData])

  if (isLoading) {
    return <AppPreloader />
  }

  return (
    <div className="coreui-content-center">
      <Card className="coreui-card-center">
        <CardHeader>
          <div className="flex items-center justify-start gap-2">
            <CardTitle>Update Invitation</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-6">
          <Form method="PUT">
            <input name="token" value={token} type="hidden" />
            <input name="invitation_id" value={invitation?.id} type="hidden" />
            <input name="workspace_id" value={params.workspace_id} type="hidden" />
            <input name="email" value={invitation?.email} type="hidden" />
            <div className="mb-3">
              <Label className="required">Email</Label>
              <Input disabled name="email" value={invitation?.email} />
            </div>
            <div className="mb-3">
              <Label className="required">Role</Label>
              <Select
                name="role"
                value={role || undefined}
                onValueChange={(value) => {
                  setRole(value)
                  onRemoveError('role', value)
                }}>
                <SelectTrigger
                  className={cn('capitalize', errorFields?.role && 'input-error')}>
                  {role || 'none'}
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => {
                    return (
                      <SelectItem key={role} value={role} className="capitalize">
                        {role}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {errorFields?.role && (
                <span className="error-message">{errorFields.role}</span>
              )}
            </div>
            <div className="mb-3">
              <Label>Message</Label>
              <Textarea name="message" defaultValue={invitation?.message} />
            </div>
            <div className="mt-10 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/workspaces/${params.workspace_id}/team`)}>
                Cancel
              </Button>
              <Button disabled={navigation.state === 'submitting'}>
                {navigation.state === 'submitting' ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  const formData = await request.formData()
  const { email, role, message, token, invitation_id, workspace_id } =
    Object.fromEntries(formData)

  const validated = invitationSchema.safeParse({ email, role, message })

  if (!validated.success) {
    return Response.json({ errors: validated.error.flatten().fieldErrors })
  }

  try {
    const endpoint = `${apiUrl}/invitations/${invitation_id}`
    await fetchApi(endpoint, token.toString(), nodeEnv, {
      method: 'PUT',
      body: JSON.stringify({ role, message }),
    })

    return redirectWithToast(`/workspaces/${workspace_id}/team`, {
      type: 'success',
      title: 'Success',
      description: 'Successfully update invitation',
    })
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(
      convertError.status === 401
        ? '/logout'
        : `/workspaces/${workspace_id}/teams/${invitation_id}/update`,
      {
        type: 'error',
        title: 'Error',
        description: `${convertError.status} - ${convertError.error}`,
      },
    )
  }
}
