/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import JSONEditor from '@/components/misc/JsonEditor'
import MarkdownEditor from '@/components/misc/Markdown/Editor'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { timezones } from '@/constants/timezone'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { digestGenerationConfigSchema } from '@/schemas/digest'
import { IDigestGenerator } from '@/types/digest'
import { cn } from '@/utils/misc'
import { redirectWithToast } from '@/utils/toast.server'
import { ActionFunctionArgs } from '@remix-run/node'
import {
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useParams,
} from '@remix-run/react'
import { FormField, FormWrapper } from 'core-ui'
import { Check, Plus, Tag, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Cron } from 'react-js-cron'
import 'react-js-cron/dist/styles.css'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function DigestGeneratorEdit() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const params = useParams()
  const { token } = useApp()
  const handleApiError = useHandleApiError()

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorFields, setErrorFields] = useState<any>()
  const [title, setTitle] = useState<string>('')
  const [generateEmptyDigest, setGenerateEmptyDigest] = useState<boolean>(false)
  const [tags, setTags] = useState<string[]>([])
  const [labels, setLabels] = useState<string>('')
  const [newTag, setNewTag] = useState<string>('')
  const [systemPrompt, setSystemPrompt] = useState<string>('')
  const [cronExpression, setCronExpression] = useState<string>('')
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [newFilterTag, setNewFilterTag] = useState<string>('')
  const [filterLabels, setFilterLabels] = useState<string>('')
  const [timezoneSelected, setTimezoneSelected] = useState<string>('')
  const [open, setOpen] = useState<boolean>(false)

  const onCancel = () =>
    navigate(`/projects/${params.project_id}/digest-generator`, {
      replace: true,
    })

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

  const addFilterTag = () => {
    if (newFilterTag.trim() && !filterTags.includes(newFilterTag.trim())) {
      setFilterTags([...filterTags, newFilterTag.trim()])
      setNewFilterTag('')
    }
  }

  const removeFilterTag = (
    tag: string,
    tagList: string[],
    setTagList: (tags: string[]) => void,
  ) => {
    setTagList(tagList.filter((t) => t !== tag))
  }

  const removeTag = (
    tag: string,
    tagList: string[],
    setTagList: (tags: string[]) => void,
  ) => {
    setTagList(tagList.filter((t) => t !== tag))
  }

  const loadConfig = async () => {
    setIsLoading(true)
    try {
      const url = `${apiUrl}/digest-generation-configs/${params.id}`
      const data: IDigestGenerator = await fetchApi(url, token!, nodeEnv)

      setTitle(data.title || '')
      setSystemPrompt(data.system_prompt || '')
      setTimezoneSelected(data.timezone || '')
      setCronExpression(data.cron_expression || '')
      setGenerateEmptyDigest(Boolean(data.generate_empty_digest))
      setTags(Array.isArray(data.tags) ? data.tags : [])
      setLabels(JSON.stringify(data.labels ?? {}, null, 2))
      setFilterTags(Array.isArray(data.filter_tags) ? data.filter_tags : [])
      setFilterLabels(JSON.stringify(data.filter_labels ?? {}, null, 2))
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token && params.id) {
      loadConfig()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, params.id])

  useEffect(() => {
    if (actionData?.errors) {
      setErrorFields(actionData.errors)
    }
  }, [actionData])

  if (isLoading) return <AppPreloader />

  return (
    <FormWrapper
      method="POST"
      title="Edit Digest Generator"
      onCancel={onCancel}
      isSubmitting={navigation.state === 'submitting'}
      hiddenInputs={{
        token: token!,
        id: params.id!,
        project_id: params.project_id!,
        system_prompt: systemPrompt,
        tags: JSON.stringify(tags),
        labels,
        filter_tags: JSON.stringify(filterTags),
        filter_labels: filterLabels,
      }}>
      <h3 className="mb-3 text-base font-semibold">General</h3>
      <Card className="shadow-none">
        <CardContent className="p-5">
          {/* Title */}
          <FormField
            label="Title"
            name="title"
            required
            autoFocus
            value={title}
            error={errorFields?.title}
            onChange={(value) => {
              setTitle(value)
              onRemoveError('title', value)
            }}
          />

          {/* System Prompt */}
          <div className="mb-3">
            <Label>System Prompt</Label>
            <MarkdownEditor
              editorHeight={200}
              value={systemPrompt}
              onUpdateChange={(val) => setSystemPrompt(val)}
            />
          </div>

          {/* Timezone */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div>
                <Label>Timezone</Label>
                <Input
                  value={timezoneSelected}
                  readOnly
                  name="timezone"
                  className="cursor-pointer text-start"
                  placeholder="Select timezone"
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
              <Command>
                <CommandInput placeholder="Search timezone..." />
                <CommandList className="max-h-60 overflow-auto">
                  <CommandEmpty>No timezone found.</CommandEmpty>
                  <CommandGroup>
                    {timezones.map((timezone) => (
                      <CommandItem
                        key={timezone}
                        value={timezone}
                        onSelect={() => {
                          setTimezoneSelected(timezone)
                          onRemoveError('timezone', timezone)
                          setOpen(false)
                        }}
                        className={cn(
                          'flex w-full cursor-pointer items-center justify-between gap-2 hover:bg-accent hover:text-accent-foreground',
                          timezoneSelected === timezone &&
                            'bg-accent text-accent-foreground',
                        )}
                        title={timezone}>
                        <span>{timezone}</span>
                        {timezoneSelected === timezone && <Check />}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Cron Expression */}
          <div className="mt-3">
            <Label>Cron Expression</Label>
            <Input
              name="cron_expression"
              value={cronExpression}
              className="mb-3"
              readOnly
            />
            <Cron value={cronExpression} setValue={setCronExpression} />
          </div>

          {/* Generate empty digest */}
          <div className="my-3 flex items-start justify-between gap-2">
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
        </CardContent>
      </Card>

      <h3 className="mb-3 mt-5 text-base font-semibold">Filters</h3>
      <Card className="shadow-none">
        <CardContent className="p-5">
          {/* Tags */}
          <div className="mb-3">
            <Label className="mb-1">Tags</Label>
            <div className={cn('flex flex-wrap gap-2', filterTags.length > 0 && 'mt-2')}>
              {filterTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                  <X
                    size={12}
                    className="ml-2 cursor-pointer hover:text-destructive"
                    onClick={() => removeFilterTag(tag, filterTags, setFilterTags)}
                  />
                </Badge>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                value={newFilterTag}
                onChange={(e) => setNewFilterTag(e.target.value)}
                placeholder="Add tag"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addFilterTag()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addFilterTag}>
                <Plus />
                Add
              </Button>
            </div>
          </div>

          {/* Labels */}
          <div className="mb-3">
            <FormField
              label="Labels"
              name="filter_labels"
              error={errorFields?.filter_labels}>
              <JSONEditor
                currentData={filterLabels}
                title="Labels"
                onChange={(val) => setFilterLabels(val)}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>
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
    filter_tags,
    filter_labels,
    labels,
    project_id,
    token,
    id,
  } = Object.fromEntries(formData)

  const validated = digestGenerationConfigSchema.safeParse({
    title: title.toString(),
    system_prompt: system_prompt.toString(),
    timezone: timezone.toString(),
    cron_expression: cron_expression.toString(),
    generate_empty_digest: generate_empty_digest === 'on',
    tags: JSON.parse(typeof tags === 'string' ? tags : ''),
    labels: JSON.parse(typeof labels === 'string' ? labels : ''),
    filter_tags: JSON.parse(typeof filter_tags === 'string' ? filter_tags : '{}'),
    filter_labels: JSON.parse(typeof filter_labels === 'string' ? filter_labels : '{}'),
  })

  if (!validated.success) {
    return Response.json({ errors: validated.error.flatten().fieldErrors })
  }

  try {
    await fetchApi(
      `${apiUrl}/digest-generation-configs/${id}`,
      token.toString(),
      nodeEnv,
      {
        method: 'PUT',
        body: JSON.stringify(validated.data),
      },
    )

    return redirectWithToast(`/projects/${project_id}/digest-generator`, {
      type: 'success',
      title: 'Success',
      description: 'Successfully updated digest generator',
    })
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(
      convertError.status === 401
        ? '/logout'
        : `/projects/${project_id}/digest-generator/${id}/edit`,
      {
        type: 'error',
        title: 'Error',
        description: `${convertError.status} - ${convertError.error}`,
      },
    )
  }
}
