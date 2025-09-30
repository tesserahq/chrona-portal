/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import JSONEditor from '@/components/misc/JsonEditor'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApp } from '@/context/AppContext'
import { fetchApi } from '@/libraries/fetch'
import { authorSchema } from '@/schemas/author'
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

  return { apiUrl, nodeEnv, authorId: params.id }
}

export default function AuthorEdit() {
  const { apiUrl, nodeEnv, authorId } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const params = useParams()
  const { token } = useApp()
  const [errorFields, setErrorFields] = useState<any>()
  const [tags, setTags] = useState<string[]>([])
  const [labels, setLabels] = useState<string>('{}')
  const [metaData, setMetaData] = useState<string>('{}')
  const [newTag, setNewTag] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [author, setAuthor] = useState<any>(null)

  const fetchAuthor = async () => {
    try {
      const response = await fetchApi(`${apiUrl}/authors/${authorId}`, token!, nodeEnv)
      setAuthor(response)

      // Set form data from author
      setTags(response.tags || [])
      setLabels(JSON.stringify(response.labels || {}))
      setMetaData(JSON.stringify(response.meta_data || {}))
    } catch (error) {
      // console.error('Error fetching author:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onCancel = () =>
    navigate(`/workspaces/${params.workspace_id}/authors`, { replace: true })

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
    if (token && authorId) {
      fetchAuthor()
    }
  }, [token, authorId])

  useEffect(() => {
    if (actionData?.errors) {
      setErrorFields(actionData.errors)
    }
  }, [actionData])

  if (isLoading) {
    return <AppPreloader />
  }

  if (!author) {
    return <div>Author not found</div>
  }

  return (
    <div className="h-full animate-slide-up">
      <FormWrapper
        method="POST"
        title="Edit Author"
        onCancel={onCancel}
        isSubmitting={navigation.state === 'submitting'}
        hiddenInputs={{
          token: token!,
          tags: JSON.stringify(tags),
          labels,
          meta_data: metaData,
        }}>
        <FormField
          label="Display Name"
          name="display_name"
          required
          autoFocus
          defaultValue={author.display_name}
          error={errorFields?.display_name}
          onChange={(value) => onRemoveError('display_name', value)}
        />

        <FormField
          label="Email"
          name="email"
          type="email"
          required
          defaultValue={author.email}
          error={errorFields?.email}
          onChange={(value) => onRemoveError('email', value)}
        />

        <FormField
          label="Avatar URL"
          name="avatar_url"
          type="url"
          defaultValue={author.avatar_url}
          error={errorFields?.avatar_url}
          onChange={(value) => onRemoveError('avatar_url', value)}
        />

        {/* Tags */}
        <div className="mt-3">
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
        <div className="mt-3">
          <FormField label="Labels" name="labels" error={errorFields?.labels}>
            <JSONEditor
              currentData={labels}
              title="Labels"
              onChange={(val) => setLabels(val)}
            />
          </FormField>
        </div>

        {/* Meta Data */}
        <div className="mt-3">
          <FormField label="Metadata" name="meta_data" error={errorFields?.meta_data}>
            <JSONEditor
              currentData={metaData}
              title="Metadata"
              onChange={(val) => setMetaData(val)}
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
  const { display_name, avatar_url, email, tags, labels, meta_data, token } =
    Object.fromEntries(formData)
  const workspace_id = params.workspace_id
  const author_id = params.id

  const validated = authorSchema.safeParse({
    display_name,
    avatar_url: avatar_url || '',
    email,
    tags: tags ? JSON.parse(tags as string) : [],
    labels: labels ? JSON.parse(labels as string) : {},
    meta_data: meta_data ? JSON.parse(meta_data as string) : {},
  })

  if (!validated.success) {
    return Response.json({ errors: validated.error.flatten().fieldErrors })
  }

  try {
    await fetchApi(`${apiUrl}/authors/${author_id}`, token.toString(), nodeEnv, {
      method: 'PUT',
      body: JSON.stringify(validated.data),
    })

    return redirectWithToast(`/workspaces/${workspace_id}/authors`, {
      type: 'success',
      title: 'Success',
      description: 'Successfully updated author',
    })
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(
      convertError.status === 401
        ? '/logout'
        : `/workspaces/${workspace_id}/authors/${author_id}/edit`,
      {
        type: 'error',
        title: 'Error',
        description: `${convertError.status} - ${convertError.error}`,
      },
    )
  }
}
