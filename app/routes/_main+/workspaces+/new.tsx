/* eslint-disable @typescript-eslint/no-explicit-any */
import Header from '@/components/misc/Header'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useApp } from '@/context/AppContext'
import { fetchApi } from '@/libraries/fetch'
import { workspaceSchema } from '@/schemas/workspace'
import {
  avatarColors,
  avatarName,
  avatarVariants,
  IWorkspaceLogo,
} from '@/types/workspace'
import { formatString } from '@/utils/format-string'
import { cn } from '@/utils/misc'
import { redirectWithToast } from '@/utils/toast.server'
import { ActionFunctionArgs } from '@remix-run/node'
import {
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from '@remix-run/react'
import Avatar from 'boring-avatars'
import { FormField, FormWrapper } from 'core-ui'
import { Check } from 'lucide-react'
import { useEffect, useState } from 'react'

export function loader() {
  const hostUrl = process.env.HOST_URL
  const nodeEnv = process.env.NODE_ENV
  const apiUrl = process.env.API_URL

  return { hostUrl, nodeEnv, apiUrl }
}

export default function WorkspaceCreate() {
  const { hostUrl, apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const { token } = useApp()
  const [errorFields, setErrorFields] = useState<any>()
  const [identifier, setIdentifier] = useState<string>('')
  const [locked, setLocked] = useState<boolean>(false)
  const [logo, setLogo] = useState<IWorkspaceLogo>({
    name: avatarName,
    variant: 'beam',
    colors: avatarColors[0],
  })

  const onCancel = () => navigate('/workspaces', { replace: true })

  const onRemoveError = (fieldName: string, value?: string) => {
    setErrorFields((prev: any) => ({
      ...prev,
      [fieldName]: value ? null : `${fieldName} is required`,
    }))
  }

  useEffect(() => {
    if (actionData?.errors) {
      setErrorFields(actionData.errors)
    }
  }, [actionData])

  return (
    <div className="bg-background">
      <div className="is-header-blur">
        <Header hostUrl={hostUrl} apiUrl={apiUrl!} nodeEnv={nodeEnv} />
      </div>
      <div className="mt-[70px] h-full gap-5 px-2 lg:px-0">
        <FormWrapper
          method="POST"
          title="Create Workspace"
          onCancel={onCancel}
          isSubmitting={navigation.state === 'submitting'}
          hiddenInputs={{
            token: token!,
            logo: JSON.stringify(logo),
          }}>
          <FormField
            label="Name"
            name="name"
            required
            autoFocus
            error={errorFields?.name}
            onChange={(value) => {
              const identiferValue = formatString('kebab-case', value)

              setIdentifier(identiferValue)
              onRemoveError('name', value)
            }}
          />
          <FormField
            label="Identifier"
            name="identifier"
            required
            value={identifier}
            error={errorFields?.identifier}
            onChange={(value) => {
              const identiferValue = formatString('kebab-case', value)

              setIdentifier(identiferValue)
              onRemoveError('identifier', value)
            }}
          />
          <FormField label="Description" name="description" type="textarea" />
          <div className="mt-3">
            <Label>Logo</Label>
            <div className="rounded border border-input p-2">
              {/* Color */}
              <div className="mb-2 text-xs">Color</div>
              <div className="flex flex-wrap items-center gap-3">
                {avatarColors.map((colors, index) => (
                  <div
                    key={index}
                    className={cn(
                      'relative flex cursor-pointer items-center gap-0 overflow-hidden rounded border border-input p-0.5',
                      JSON.stringify(logo.colors) === JSON.stringify(colors) &&
                        'border-primary',
                    )}
                    onClick={() => setLogo({ ...logo, colors })}>
                    {colors.map((bgColor, idx) => (
                      <div
                        key={idx}
                        style={{ background: bgColor }}
                        className={`h-10 w-5`}></div>
                    ))}
                    {JSON.stringify(logo.colors) === JSON.stringify(colors) && (
                      <div className="absolute right-1 top-1 rounded-full bg-primary p-1 text-background">
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Type */}
              <div className="my-2 text-xs">Type</div>
              <div className="flex flex-wrap items-center gap-2">
                {avatarVariants.map((type, index) => (
                  <div
                    key={index}
                    className="relative flex cursor-pointer flex-col items-center gap-1 rounded-full p-0"
                    onClick={() => setLogo({ ...logo, variant: type })}>
                    <Avatar
                      name={logo.name}
                      size={40}
                      variant={type as any}
                      colors={logo.colors}
                    />
                    <span
                      className={cn(
                        'text-xs text-muted-foreground',
                        logo.variant === type && 'font-medium text-primary',
                      )}>
                      {type}
                    </span>
                  </div>
                ))}
              </div>

              {/* Preview */}
              <div className="mt-5 flex w-full flex-col items-center justify-center">
                <Avatar
                  name={logo.name}
                  variant={logo.variant as any}
                  size={150}
                  colors={logo.colors}
                />
                <div className="mb-3 mt-2 text-xs text-muted-foreground">Preview</div>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-start justify-between gap-2">
              <Label htmlFor="locked" className="text-sm font-medium">
                Lock workspace
              </Label>
              <Switch
                id="locked"
                name="locked"
                checked={locked}
                className="border-input"
                onCheckedChange={(checked) => setLocked(Boolean(checked))}
              />
            </div>
            <Alert variant="warning" className="flex items-center">
              <AlertTitle>When locked, workspace can`t be deleted.</AlertTitle>
            </Alert>
          </div>
        </FormWrapper>
      </div>
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const formData = await request.formData()
  const { name, description, identifier, locked, token, logo } =
    Object.fromEntries(formData)

  const validated = workspaceSchema.safeParse({
    name,
    description,
    identifier,
    locked: locked === 'on',
  })

  if (!validated.success) {
    return Response.json({ errors: validated.error.flatten().fieldErrors })
  }

  try {
    const response = await fetchApi(`${apiUrl}/workspaces`, token.toString(), nodeEnv, {
      method: 'POST',
      body: JSON.stringify({
        name: name.toString(),
        description: description.toString(),
        identifier: identifier.toString(),
        locked: locked === 'on',
        logo,
      }),
    })

    return redirectWithToast(`/workspaces/${response.id}/overview`, {
      type: 'success',
      title: 'Success',
      description: 'Successfully created workspace',
    })
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(
      convertError.status === 401 ? '/logout' : '/workspaces/new',
      {
        type: 'error',
        title: 'Error',
        description: `${convertError.status} - ${convertError.error}`,
      },
    )
  }
}
