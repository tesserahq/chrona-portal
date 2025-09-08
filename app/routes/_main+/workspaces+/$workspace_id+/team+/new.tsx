/* eslint-disable @typescript-eslint/no-explicit-any */
import InputEmail from '@/components/misc/InputEmail'
import { MultiSelect } from '@/components/misc/MultiSelect'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { fetchApi } from '@/libraries/fetch'
import { invitationSchema } from '@/schemas/invitation'
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

export default function TeamNew() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const [role, setRole] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const actionData = useActionData<typeof action>()
  const params = useParams()
  const navigation = useNavigation()
  const navigate = useNavigate()
  const [errorFields, setErrorFields] = useState<any>()
  const { getAccessTokenSilently } = useAuth0()
  const roles = ['owner', 'collaborator', 'admin']
  const [errorEmail, setErrorEmail] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([])

  const fetchProjects = async () => {
    try {
      const token = await getAccessTokenSilently()
      const url = `${apiUrl}/workspaces/${params.workspace_id}/projects`
      const response = await fetchApi(url, token, nodeEnv)

      // mapping projects to get id and name
      const projects = response.data.map(({ id, name }: any) => ({
        key: name,
        value: id,
      }))
      setProjects(projects)
      setToken(token)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const onRemoveError = (fieldName: string, value?: string) => {
    setErrorFields((prev: any) => ({
      ...prev,
      [fieldName]: value ? null : `${fieldName} is required`,
    }))
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (actionData?.errors) {
      setErrorFields(actionData.errors)
    }
  }, [actionData])

  return (
    <div className="coreui-content-center">
      <Card className="coreui-card-center">
        <CardHeader>
          <div className="flex items-center justify-start gap-2">
            <CardTitle>Invite a member to this workspace</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-6">
          <Form method="POST">
            <input name="token" value={token} type="hidden" />
            <input name="workspace_id" value={params.workspace_id} type="hidden" />
            <input
              name="projects"
              value={JSON.stringify(selectedProjectIds)}
              type="hidden"
            />
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
              <InputEmail
                required
                name="email"
                errorMessage={errorFields?.email ? errorFields?.email || '' : ''}
                callbackError={(errorMessage) => {
                  if (errorMessage === '') {
                    setErrorEmail(false)
                  }

                  setErrorFields({ ...errorFields, email: errorMessage })
                }}
                trigger="onBlur"
              />
            </div>
            <div className="mb-3">
              <Label>Projects</Label>
              <MultiSelect
                options={projects}
                selectedDisplay="key"
                placeholder={isLoading ? 'Loading...' : 'Select project'}
                variant="inverted"
                animation={2}
                maxCount={8}
                onValueChange={setSelectedProjectIds}
                disabled={isLoading}
              />
            </div>
            <div className="mb-3">
              <Label>Message</Label>
              <Textarea name="message" />
            </div>
            <div className="mt-10 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/workspaces/${params.workspace_id}/team`)}>
                Cancel
              </Button>
              <Button disabled={navigation.state === 'submitting' || errorEmail || !role}>
                {navigation.state === 'submitting' ? 'Sending...' : 'Send invitation'}
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
  const { email, role, message, token, workspace_id, projects } =
    Object.fromEntries(formData)

  const validated = invitationSchema.safeParse({ email, role, message })

  if (!validated.success) {
    return Response.json({ errors: validated.error.flatten().fieldErrors })
  }

  const projectConvert = JSON.parse(projects.toString())
  const projectSelected = projectConvert.map((val: string) => ({
    id: val,
    role: 'collabolator',
  }))

  const payload = {
    email,
    role,
    message,
    projects: projectSelected,
  }

  try {
    const endpoint = `${apiUrl}/workspaces/${workspace_id}/invitations`
    await fetchApi(endpoint, token.toString(), nodeEnv, {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    return redirectWithToast(`/workspaces/${workspace_id}/team`, {
      type: 'success',
      title: 'Success',
      description: `Successfully send invitation to ${email}`,
    })
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(
      convertError.status === 401 ? '/logout' : `/workspaces/${workspace_id}/team/new`,
      {
        type: 'error',
        title: 'Error',
        description: `${convertError.status} - ${convertError.error}`,
      },
    )
  }
}
