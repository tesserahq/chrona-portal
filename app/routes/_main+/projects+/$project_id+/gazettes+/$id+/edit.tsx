/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import JSONEditor from '@/components/misc/JsonEditor'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { gazetteSchema } from '@/schemas/gazette'
import { IGazette } from '@/types/gazette'
import { cn } from '@/utils/misc'
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
import { Plus, Tag, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export function loader({ params }: LoaderFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, gazetteId: params.id }
}

export default function GazetteEdit() {
  const { apiUrl, nodeEnv, gazetteId } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const params = useParams()
  const { token } = useApp()
  const handleApiError = useHandleApiError()
  const [errorFields, setErrorFields] = useState<any>()
  const [tags, setTags] = useState<string[]>([])
  const [labels, setLabels] = useState<string>('{}')
  const [newTag, setNewTag] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [gazette, setGazette] = useState<IGazette | null>(null)

  const fetchGazette = async () => {
    try {
      const response = await fetchApi(`${apiUrl}/gazettes/${gazetteId}`, token!, nodeEnv)
      setGazette(response)

      // Set form data from gazette
      setTags(response.tags || [])
      setLabels(JSON.stringify(response.labels || {}))
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const onCancel = () =>
    navigate(`/projects/${params.project_id}/gazettes`, { replace: true })

  const onRemoveError = (fieldName: string, value?: string) => {
    setErrorFields((prev: any) => ({
      ...prev,
      [fieldName]: value ? null : `${fieldName} is required`,
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (
    tag: string,
    tagList: string[],
    setTagList: (tags: string[]) => void,
  ) => {
    setTagList(tagList.filter((t) => t !== tag))
  }

  useEffect(() => {
    if (token && gazetteId) {
      fetchGazette()
    }
  }, [token, gazetteId])

  useEffect(() => {
    if (actionData?.errors) {
      setErrorFields(actionData.errors)
    }
  }, [actionData])

  if (isLoading) {
    return <AppPreloader />
  }

  if (!gazette) {
    return <div>Gazette not found</div>
  }

  return (
    <div className="h-full animate-slide-up">
      <FormWrapper
        method="POST"
        title="Edit Gazette"
        onCancel={onCancel}
        isSubmitting={navigation.state === 'submitting'}
        hiddenInputs={{
          token: token!,
          tags: JSON.stringify(tags),
          labels,
          project_id: params.project_id!,
        }}>
        {/* Header */}
        <FormField
          label="Header"
          name="header"
          required
          autoFocus
          defaultValue={gazette.header}
          error={errorFields?.header}
          onChange={(value) => onRemoveError('header', value)}
        />

        {/* Subheader */}
        <FormField
          label="Subheader"
          name="subheader"
          defaultValue={gazette.subheader}
          error={errorFields?.subheader}
          onChange={(value) => onRemoveError('subheader', value)}
        />

        {/* Theme */}
        <div className="mb-3">
          <Label>Theme</Label>
          <Input
            name="theme"
            defaultValue={gazette.theme}
            readOnly
            className="capitalize"
          />
        </div>

        {/* Tags */}
        <div className="mb-3">
          <Label className="mb-1">Tags</Label>
          <div className={cn('flex flex-wrap gap-2', tags.length > 0 && 'mt-2')}>
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {tag}
                <X
                  size={12}
                  className="ml-2 cursor-pointer hover:text-destructive"
                  onClick={() => removeTag(tag, tags, setTags)}
                />
              </Badge>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tag"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag()
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addTag}>
              <Plus />
              Add
            </Button>
          </div>
        </div>

        {/* Labels */}
        <div className="mb-3">
          <FormField label="Labels" name="labels" error={errorFields?.labels}>
            <JSONEditor
              currentData={labels}
              title="Labels"
              onChange={(val) => setLabels(val)}
            />
          </FormField>
        </div>
      </FormWrapper>
    </div>
  )
}

export async function action({ request, params }: ActionFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const formData = await request.formData()
  const { header, subheader, theme, tags, labels, body, project_id, token } =
    Object.fromEntries(formData)
  const gazette_id = params.id

  const validated = gazetteSchema.safeParse({
    header,
    subheader: subheader || '',
    body,
    theme: theme || 'default',
    project_id,
    tags: tags ? JSON.parse(tags as string) : [],
    labels: labels ? JSON.parse(labels as string) : {},
  })

  if (!validated.success) {
    return Response.json({ errors: validated.error.flatten().fieldErrors })
  }

  try {
    await fetchApi(`${apiUrl}/gazettes/${gazette_id}`, token.toString(), nodeEnv, {
      method: 'PUT',
      body: JSON.stringify(validated.data),
    })

    return redirectWithToast(`/projects/${project_id}/gazettes`, {
      type: 'success',
      title: 'Success',
      description: 'Successfully updated gazette',
    })
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(
      convertError.status === 401
        ? '/logout'
        : `/projects/${project_id}/gazettes/${gazette_id}/edit`,
      {
        type: 'error',
        title: 'Error',
        description: `${convertError.status} - ${convertError.error}`,
      },
    )
  }
}
