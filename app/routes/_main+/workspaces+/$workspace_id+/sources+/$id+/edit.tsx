/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import { useApp } from '@/context/AppContext'
import { fetchApi } from '@/libraries/fetch'
import { sourceSchema } from '@/schemas/source'
import { redirectWithToast } from '@/utils/toast.server'
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import {
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useParams,
} from '@remix-run/react'
import { FormField, FormWrapper } from 'core-ui'
import { useEffect, useState } from 'react'

export function loader({ params }: LoaderFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, sourceId: params.id }
}

export default function SourceEdit() {
  const { apiUrl, nodeEnv, sourceId } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const params = useParams()
  const { token } = useApp()
  const [errorFields, setErrorFields] = useState<any>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [source, setSource] = useState<any>(null)

  const fetchSource = async () => {
    try {
      const response = await fetchApi(`${apiUrl}/sources/${sourceId}`, token!, nodeEnv)
      setSource(response)
    } catch (error) {
      // console.error('Error fetching source:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onCancel = () =>
    navigate(`/workspaces/${params.workspace_id}/sources`, { replace: true })

  const onRemoveError = (fieldName: string, value?: string) => {
    setErrorFields((prev: any) => ({
      ...prev,
      [fieldName]: value ? null : `${fieldName} is required`,
    }))
  }

  useEffect(() => {
    if (token && sourceId) {
      fetchSource()
    }
  }, [token, sourceId])

  useEffect(() => {
    if (actionData?.errors) {
      setErrorFields(actionData.errors)
    }
  }, [actionData])

  if (isLoading) {
    return <AppPreloader />
  }

  if (!source) {
    return <div>Source not found</div>
  }

  return (
    <div className="h-full animate-slide-up">
      <FormWrapper
        method="POST"
        title="Edit Source"
        onCancel={onCancel}
        isSubmitting={navigation.state === 'submitting'}
        hiddenInputs={{
          token: token!,
        }}>
        <FormField
          label="Name"
          name="name"
          required
          autoFocus
          defaultValue={source.name}
          error={errorFields?.name}
          onChange={(value) => onRemoveError('name', value)}
        />

        <FormField
          label="Identifier"
          name="identifier"
          required
          defaultValue={source.identifier}
          error={errorFields?.identifier}
          onChange={(value) => onRemoveError('identifier', value)}
        />

        <FormField
          label="Description"
          name="description"
          type="textarea"
          defaultValue={source.description}
          error={errorFields?.description}
          onChange={(value) => onRemoveError('description', value)}
        />
      </FormWrapper>
    </div>
  )
}

export async function action({ request, params }: ActionFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const formData = await request.formData()
  const { name, description, identifier, token } = Object.fromEntries(formData)
  const workspace_id = params.workspace_id
  const source_id = params.id

  const validated = sourceSchema.safeParse({
    name,
    description: description || '',
    identifier,
  })

  if (!validated.success) {
    return Response.json({ errors: validated.error.flatten().fieldErrors })
  }

  try {
    await fetchApi(`${apiUrl}/sources/${source_id}`, token.toString(), nodeEnv, {
      method: 'PUT',
      body: JSON.stringify(validated.data),
    })

    return redirectWithToast(`/workspaces/${workspace_id}/sources`, {
      type: 'success',
      title: 'Success',
      description: 'Successfully updated source',
    })
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(
      convertError.status === 401
        ? '/logout'
        : `/workspaces/${workspace_id}/sources/${source_id}/edit`,
      {
        type: 'error',
        title: 'Error',
        description: `${convertError.status} - ${convertError.error}`,
      },
    )
  }
}
