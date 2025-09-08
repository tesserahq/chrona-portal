/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import { fetchApi } from '@/libraries/fetch'
import { invitationSchema } from '@/schemas/invitation'
import { Invitation } from '@/types/invitation'
import { redirectWithToast } from '@/utils/toast.server'
import { useAuth0 } from '@auth0/auth0-react'
import { ActionFunctionArgs } from '@remix-run/node'
import {
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useParams,
} from '@remix-run/react'
import { FormField, FormSelect, FormWrapper } from 'core-ui'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function MemberUpdate() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
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
    } catch (error: any) {
      const convertError = JSON.parse(error?.message)

      if (convertError.status === 401) {
        navigate('/logout')
      }

      toast.error(`${convertError.status} - ${convertError.error}`)
    }

    setIsLoading(false)
  }

  const roleOptions = roles.map((role) => ({ label: role, value: role }))

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
    <FormWrapper
      method="PUT"
      title="Update Project Invitation"
      isSubmitting={navigation.state === 'submitting'}
      onCancel={() => navigate(`/projects/${params.project_id}/members`)}
      hiddenInputs={{
        token: token,
        invitation_id: invitation?.id || '',
        project_id: params.project_id || '',
        email: invitation?.email || '',
        role: invitation?.role || '',
      }}>
      <FormSelect
        label="Role"
        name="role"
        value="collaborator"
        required
        options={roleOptions}
        disabled
      />
      <FormField
        label="Email"
        name="email"
        required
        defaultValue={invitation?.email}
        error={errorFields?.email}
        disabled
      />
      <FormField label="Message" name="message" type="textarea" />
    </FormWrapper>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  const formData = await request.formData()
  const { email, role, message, token, invitation_id, project_id } =
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

    return redirectWithToast(`/projects/${project_id}/members`, {
      type: 'success',
      title: 'Success',
      description: 'Successfully update invitation',
    })
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(
      convertError.status === 401
        ? '/logout'
        : `/projects/${project_id}/members/${invitation_id}/update`,
      {
        type: 'error',
        title: 'Error',
        description: `${convertError.status} - ${convertError.error}`,
      },
    )
  }
}
