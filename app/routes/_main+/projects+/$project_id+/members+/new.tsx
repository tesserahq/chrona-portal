/* eslint-disable @typescript-eslint/no-explicit-any */
import InputEmail from '@/components/misc/InputEmail'
import { fetchApi } from '@/libraries/fetch'
import { getWorkspaceID } from '@/libraries/storage'
import { invitationSchema } from '@/schemas/invitation'
import { redirectWithToast } from '@/utils/toast.server'
import { useAuth0 } from '@auth0/auth0-react'
import { ActionFunctionArgs } from '@remix-run/node'
import { useActionData, useNavigate, useNavigation, useParams } from '@remix-run/react'
import { FormField, FormSelect, FormWrapper } from 'core-ui'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function MemberNew() {
  const [token, setToken] = useState<string>('')
  const actionData = useActionData<typeof action>()
  const params = useParams()
  const navigation = useNavigation()
  const navigate = useNavigate()
  const [errorFields, setErrorFields] = useState<any>()
  const { getAccessTokenSilently } = useAuth0()
  const roles = ['owner', 'collaborator', 'admin']
  const [, setErrorEmail] = useState<boolean>(true)
  const [workspaceId, setWorkspaceId] = useState<string>('')

  const fetchToken = async () => {
    try {
      const token = await getAccessTokenSilently()
      const workspaceId = getWorkspaceID()

      setToken(token)
      if (workspaceId) setWorkspaceId(workspaceId)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const roleOptions = roles.map((role) => ({ label: role, value: role }))

  useEffect(() => {
    fetchToken()
  }, [])

  useEffect(() => {
    if (actionData?.errors) {
      setErrorFields(actionData.errors)
    }
  }, [actionData])

  return (
    <FormWrapper
      method="POST"
      title="Invite a member to this project"
      isSubmitting={navigation.state === 'submitting'}
      onCancel={() => navigate(`/projects/${params.project_id}/members`)}
      hiddenInputs={{
        token: token,
        workspace_id: workspaceId,
        project_id: params.project_id || '',
        role: 'collaborator',
      }}>
      <FormSelect
        label="Role"
        name="role"
        value="collaborator"
        required
        options={roleOptions}
        disabled
      />
      <FormField label="" name="email" autoFocus error={errorFields?.email}>
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
      </FormField>
      <FormField label="Message" name="message" type="textarea" />
    </FormWrapper>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  const formData = await request.formData()
  const { email, role, message, token, workspace_id, project_id } =
    Object.fromEntries(formData)

  const validated = invitationSchema.safeParse({ email, role, message })

  if (!validated.success) {
    return Response.json({ errors: validated.error.flatten().fieldErrors })
  }

  try {
    const endpoint = `${apiUrl}/workspaces/${workspace_id}/invitations`
    const payload = {
      email,
      role,
      message,
      projects: [{ id: project_id, role: 'collaborator' }],
    }

    await fetchApi(endpoint, token.toString(), nodeEnv, {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    return redirectWithToast(`/projects/${project_id}/members`, {
      type: 'success',
      title: 'Success',
      description: `Successfully send invitation to ${email}`,
    })
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(
      convertError.status === 401 ? '/logout' : `/projects/${project_id}/members/new`,
      {
        type: 'error',
        title: 'Error',
        description: `${convertError.status} - ${convertError.error}`,
      },
    )
  }
}
