/* eslint-disable @typescript-eslint/no-explicit-any */
import Header from '@/components/misc/Header'
import { Alert, AlertTitle } from '@/components/ui/alert'
import LogoSelectorDialog from '@/components/misc/Dialog/LogoSelector'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useApp } from '@/context/AppContext'
import { fetchApi } from '@/libraries/fetch'
import { workspaceSchema } from '@/schemas/workspace'
import { avatarColors, avatarName, IWorkspace, IWorkspaceLogo } from '@/types/workspace'
import { formatString } from '@/utils/format-string'
import { redirectWithToast } from '@/utils/toast.server'
import { ActionFunctionArgs } from '@remix-run/node'
import {
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from '@remix-run/react'
import Avatar from 'boring-avatars'
import { FormField, FormSelect, FormWrapper } from 'core-ui'
import { Edit3 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useHandleApiError } from '@/hooks/useHandleApiError'

export function loader() {
  const hostUrl = process.env.HOST_URL
  const nodeEnv = process.env.NODE_ENV
  const apiUrl = process.env.API_URL
  const quoreApiUrl = process.env.QUORE_API_URL

  return { hostUrl, nodeEnv, apiUrl, quoreApiUrl }
}

export default function WorkspaceCreate() {
  const { hostUrl, apiUrl, nodeEnv, quoreApiUrl } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const handleApiError = useHandleApiError()
  const { token } = useApp()
  const [errorFields, setErrorFields] = useState<any>()
  const [identifier, setIdentifier] = useState<string>('')
  const [locked, setLocked] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [logo, setLogo] = useState<IWorkspaceLogo>({
    name: avatarName,
    variant: 'beam',
    colors: avatarColors[0],
  })
  const [quoreWorkspace, setQuoreWorkspace] = useState<IWorkspace[]>([])
  const [quoreWorkspaceId, setQuoreWorkspaceId] = useState<string>('')

  const logoSelectorRef = useRef<React.ElementRef<typeof LogoSelectorDialog>>(null)

  const getQuoreWorkspaces = async () => {
    try {
      const response = await fetchApi(`${quoreApiUrl}/workspaces`, token!, nodeEnv)

      setQuoreWorkspace(response.data)
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const onCancel = () => navigate('/workspaces', { replace: true })

  const onRemoveError = (fieldName: string, value?: string) => {
    setErrorFields((prev: any) => ({
      ...prev,
      [fieldName]: value ? null : `${fieldName} is required`,
    }))
  }

  useEffect(() => {
    if (token) getQuoreWorkspaces()
  }, [token])

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
              onRemoveError('identifier', identiferValue)
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

          <FormSelect
            label="Quore Workspace"
            name="quore_workspace_id"
            loading={isLoading}
            value={quoreWorkspaceId}
            onValueChange={setQuoreWorkspaceId}
            options={quoreWorkspace.map((workspace) => ({
              label: workspace.name,
              value: workspace.id,
            }))}
          />

          <div className="mt-3">
            <Label>Logo</Label>
            <div className="flex items-center justify-between rounded border border-input p-3">
              <div className="flex items-center gap-3">
                <Avatar
                  name={logo.name}
                  variant={logo.variant as any}
                  size={40}
                  colors={logo.colors}
                />
                <div>
                  <div className="mb-0.5 text-sm font-medium capitalize">
                    {logo.variant}
                  </div>
                  <div className="flex items-center">
                    {logo.colors.map((bgColor, idx) => (
                      <div
                        key={idx}
                        style={{ background: bgColor }}
                        className="h-4 w-4"></div>
                    ))}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => logoSelectorRef.current?.onOpen(logo)}>
                <Edit3 size={14} className="mr-2" />
                Customize
              </Button>
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

      <LogoSelectorDialog ref={logoSelectorRef} onLogoChange={setLogo} />
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const formData = await request.formData()
  const { name, description, identifier, locked, token, logo, quore_workspace_id } =
    Object.fromEntries(formData)

  const validated = workspaceSchema.safeParse({
    name,
    description,
    identifier,
    locked: locked === 'on',
    quore_workspace_id,
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
        quore_workspace_id: quore_workspace_id.toString(),
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
