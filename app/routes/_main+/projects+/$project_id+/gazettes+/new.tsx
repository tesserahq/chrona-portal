/* eslint-disable @typescript-eslint/no-explicit-any */
import JSONEditor from '@/components/misc/JsonEditor'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApp } from '@/context/AppContext'
import { fetchApi } from '@/libraries/fetch'
import { gazetteSchema } from '@/schemas/gazette'
import { cn } from '@/utils/misc'
import { redirectWithToast } from '@/utils/toast.server'
import { ActionFunctionArgs } from '@remix-run/node'
import { useActionData, useNavigate, useNavigation, useParams } from '@remix-run/react'
import { FormField, FormWrapper } from 'core-ui'
import { Plus, Tag, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function GazetteCreate() {
  const actionData = useActionData<typeof action>()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const params = useParams()
  const { token } = useApp()
  const [errorFields, setErrorFields] = useState<any>()
  const [labels, setLabels] = useState<string>('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState<string>('')

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
    if (actionData?.errors) {
      setErrorFields(actionData.errors)
    }
  }, [actionData])

  return (
    <FormWrapper
      method="POST"
      title="Create Gazette"
      onCancel={onCancel}
      isSubmitting={navigation.state === 'submitting'}
      hiddenInputs={{
        token: token!,
        project_id: params.project_id!,
        tags: JSON.stringify(tags),
        labels,
      }}>
      {/* Header */}
      <FormField
        label="Header"
        name="header"
        required
        autoFocus
        error={errorFields?.header}
        onChange={(value) => onRemoveError('header', value)}
      />

      {/* Subheader */}
      <FormField
        label="Subheader"
        name="subheader"
        error={errorFields?.subheader}
        onChange={(value) => onRemoveError('subheader', value)}
      />

      {/* Theme */}
      <div className="mb-3">
        <Label>Theme</Label>
        <Input name="theme" value="default" readOnly className="capitalize" />
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
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const formData = await request.formData()
  const { header, subheader, theme, tags, labels, project_id, token } =
    Object.fromEntries(formData)

  const validated = gazetteSchema.safeParse({
    header: header.toString(),
    subheader: subheader.toString(),
    theme: theme.toString(),
    project_id: project_id.toString(),
    tags: JSON.parse(typeof tags === 'string' ? tags : '[]'),
    labels: JSON.parse(typeof labels === 'string' ? labels : '{}'),
  })

  if (!validated.success) {
    return Response.json({ errors: validated.error.flatten().fieldErrors })
  }

  try {
    await fetchApi(
      `${apiUrl}/projects/${project_id}/gazettes`,
      token.toString(),
      nodeEnv,
      {
        method: 'POST',
        body: JSON.stringify(validated.data),
      },
    )

    return redirectWithToast(`/projects/${project_id}/gazettes`, {
      type: 'success',
      title: 'Success',
      description: 'Successfully created gazette',
    })
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(
      convertError.status === 401 ? '/logout' : `/projects/${project_id}/gazettes/new`,
      {
        type: 'error',
        title: 'Error',
        description: `${convertError.status} - ${convertError.error}`,
      },
    )
  }
}
