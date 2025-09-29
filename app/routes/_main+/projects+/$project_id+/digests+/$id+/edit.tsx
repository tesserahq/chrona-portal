/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import MarkdownEditor from '@/components/misc/Markdown/Editor'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { redirectWithToast } from '@/utils/toast.server'
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, useNavigate, useNavigation, useParams } from '@remix-run/react'
import { FormSelect, FormWrapper } from 'core-ui'
import { useEffect, useState } from 'react'

export function loader({ params }: LoaderFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, digestId: params.id }
}

export default function DigestEdit() {
  const { apiUrl, nodeEnv, digestId } = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const params = useParams()
  const { token } = useApp()
  const handleApiError = useHandleApiError()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  // const [digest, setDigest] = useState<IDigest | null>(null)
  const [body, setBody] = useState<string>('')
  const [status, setStatus] = useState<string>('')

  const fetchDigest = async () => {
    try {
      const response = await fetchApi(`${apiUrl}/digests/${digestId}`, token!, nodeEnv)
      // setDigest(response)
      setBody(response.body || '')
      setStatus(response.status || '')
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const onCancel = () =>
    navigate(`/projects/${params.project_id}/digests`, { replace: true })

  useEffect(() => {
    if (token && digestId) {
      fetchDigest()
    }
  }, [token, digestId])

  if (isLoading) {
    return <AppPreloader />
  }

  const statusOptions = [
    { label: 'Generating', value: 'generating' },
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
    { label: 'Archived', value: 'archived' },
  ]

  return (
    <div className="h-full animate-slide-up">
      <FormWrapper
        method="POST"
        title="Edit Digest"
        onCancel={onCancel}
        isSubmitting={navigation.state === 'submitting'}
        hiddenInputs={{
          token: token!,
        }}>
        <div className="mb-3 space-y-2">
          <label className="text-sm font-medium">Content</label>
          <MarkdownEditor
            value={body}
            onUpdateChange={setBody}
            name="body"
            editorHeight={400}
            autofocus
          />
        </div>

        <FormSelect
          label="Status"
          name="status"
          value={status}
          onValueChange={setStatus}
          options={statusOptions}
        />
      </FormWrapper>
    </div>
  )
}

export async function action({ request, params }: ActionFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  const formData = await request.formData()
  const token = formData.get('token') as string
  const body = formData.get('body') as string
  const status = formData.get('status') as string

  try {
    await fetchApi(`${apiUrl}/digests/${params.id}`, token, nodeEnv, {
      method: 'PUT',
      body: JSON.stringify({
        body,
        status,
      }),
    })

    return redirectWithToast(`/projects/${params.project_id}/digests`, {
      type: 'success',
      title: 'Success',
      description: 'Successfully updated digest',
    })
  } catch (error: any) {
    return redirectWithToast(`/projects/${params.project_id}/digests/${params.id}/edit`, {
      type: 'error',
      title: 'Error',
      description: `${error.status} - ${error.message}`,
    })
  }
}
