/* eslint-disable @typescript-eslint/no-explicit-any */
import JSONEditor from '@/components/misc/JsonEditor'
import MarkdownEditor from '@/components/misc/Markdown/Editor'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useApp } from '@/context/AppContext'
import { fetchApi } from '@/libraries/fetch'
import { digestGenerationConfigSchema } from '@/schemas/digest'
import { cn } from '@/utils/misc'
import { redirectWithToast } from '@/utils/toast.server'
import { ActionFunctionArgs } from '@remix-run/node'
import { useActionData, useNavigate, useNavigation, useParams } from '@remix-run/react'
import { FormField, FormWrapper } from 'core-ui'
import { Plus, Tag, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function DigestGeneratorCreate() {
  const actionData = useActionData<typeof action>()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const params = useParams()
  const { token } = useApp()
  const [errorFields, setErrorFields] = useState<any>()
  const [generateEmptyDigest, setGenerateEmptyDigest] = useState<boolean>(false)
  const [tags, setTags] = useState<string[]>([])
  const [labels, setLabels] = useState<string>('')
  const [newTag, setNewTag] = useState<string>('')
  const [systemPrompt, setSystemPrompt] = useState<string>('')

  const onCancel = () =>
    navigate(`/projects/${params.project_id}/digest-generator`, { replace: true })

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

  // const addLabel = (
  //   labelList: Record<string, any>,
  //   setLabelList: (labels: Record<string, any>) => void,
  // ) => {
  //   if (newLabelKey.trim() && newLabelValue.trim()) {
  //     setLabelList({
  //       ...labelList,
  //       [newLabelKey.trim()]: newLabelValue.trim(),
  //     })
  //     setNewLabelKey('')
  //     setNewLabelValue('')
  //   }
  // }

  // const removeLabel = (
  //   key: string,
  //   labelList: Record<string, any>,
  //   setLabelList: (labels: Record<string, any>) => void,
  // ) => {
  //   const newLabels = { ...labelList }
  //   delete newLabels[key]
  //   setLabelList(newLabels)
  // }

  useEffect(() => {
    if (actionData?.errors) {
      setErrorFields(actionData.errors)
    }
  }, [actionData])

  return (
    <FormWrapper
      method="POST"
      title="Create Digest Generator"
      onCancel={onCancel}
      isSubmitting={navigation.state === 'submitting'}
      hiddenInputs={{
        token: token!,
        project_id: params.project_id!,
        system_prompt: systemPrompt,
        tags: JSON.stringify(tags),
        labels,
      }}>
      <FormField
        label="Title"
        name="title"
        required
        autoFocus
        error={errorFields?.title}
        onChange={(value) => onRemoveError('title', value)}
      />

      {/* Labels */}
      <div className="mt-3">
        <FormField label="Labels" name="labels" required error={errorFields?.labels}>
          <JSONEditor
            currentData={labels}
            title="Labels"
            onChange={(val) => setLabels(val)}
          />
        </FormField>
      </div>

      <div className="my-3">
        <Label>System Prompt</Label>
        <MarkdownEditor
          editorHeight={200}
          value={systemPrompt}
          onUpdateChange={(val) => setSystemPrompt(val)}
        />
      </div>

      <FormField
        label="Timezone"
        name="timezone"
        onChange={(value) => onRemoveError('timezone', value)}
      />

      <FormField
        label="Cron Expression"
        name="cron_expression"
        onChange={(value) => onRemoveError('cron_expression', value)}
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

      <div className="mt-3 flex items-start justify-between gap-2">
        <Label htmlFor="generate_empty_digest" className="text-sm font-medium">
          Generate empty digest
        </Label>
        <Switch
          id="generate_empty_digest"
          name="generate_empty_digest"
          checked={generateEmptyDigest}
          className="border-input"
          onCheckedChange={(checked) => setGenerateEmptyDigest(Boolean(checked))}
        />
      </div>
    </FormWrapper>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const formData = await request.formData()
  const {
    title,
    system_prompt,
    timezone,
    cron_expression,
    generate_empty_digest,
    tags,
    labels,
    project_id,
    token,
  } = Object.fromEntries(formData)

  console.log('labels ', labels)

  const validated = digestGenerationConfigSchema.safeParse({
    title: title.toString(),
    system_prompt: system_prompt.toString(),
    timezone: timezone.toString(),
    cron_expression: cron_expression.toString(),
    generate_empty_digest: generate_empty_digest === 'on',
    tags: JSON.parse(tags as string),
    labels: JSON.parse(labels as string),
  })

  if (!validated.success) {
    return Response.json({ errors: validated.error.flatten().fieldErrors })
  }

  try {
    await fetchApi(
      `${apiUrl}/projects/${project_id}/digest-generation-configs`,
      token.toString(),
      nodeEnv,
      {
        method: 'POST',
        body: JSON.stringify(validated.data),
      },
    )

    return redirectWithToast(`/projects/${project_id}/digest-generator`, {
      type: 'success',
      title: 'Success',
      description: 'Successfully created digest generator',
    })
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(
      convertError.status === 401
        ? '/logout'
        : `/projects/${project_id}/digest-generator/new`,
      {
        type: 'error',
        title: 'Error',
        description: `${convertError.status} - ${convertError.error}`,
      },
    )
  }
}
