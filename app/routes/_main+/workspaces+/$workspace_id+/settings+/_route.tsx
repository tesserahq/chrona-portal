/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import ModalDelete from '@/components/misc/Dialog/DeleteConfirmation'
import LogoSelectorDialog from '@/components/misc/Dialog/LogoSelector'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { workspaceSchema } from '@/schemas/workspace'
import { avatarColors, avatarName, IWorkspace, IWorkspaceLogo } from '@/types/workspace'
import { formatString } from '@/utils/format-string'
import { redirectWithToast } from '@/utils/toast.server'
import { ActionFunctionArgs } from '@remix-run/node'
import { useActionData, useLoaderData, useNavigation, useParams } from '@remix-run/react'
import Avatar from 'boring-avatars'
import { FormField, FormSelect, FormWrapper } from 'core-ui'
import { Check, Copy, Edit3, TriangleAlert } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export function loader() {
  return {
    apiUrl: process.env.API_URL,
    nodeEnv: process.env.NODE_ENV,
    quoreApiUrl: process.env.QUORE_API_URL,
  }
}

export default function WorkspaceSetting() {
  const { apiUrl, nodeEnv, quoreApiUrl } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const params = useParams()
  const navigation = useNavigation()
  const handleApiError = useHandleApiError()
  const [workspace, setWorkspace] = useState<IWorkspace>()
  const { token } = useApp()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLoadingQuoreWorkspaces, setIsLoadingQuoreWorkspaces] = useState<boolean>(true)
  const [errorFields, setErrorFields] = useState<any>()
  const [identifier, setIdentifier] = useState<string>('')
  const [locked, setLocked] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)
  const [logo, setLogo] = useState<IWorkspaceLogo>()
  const [quoreWorkspaces, setQuoreWorkspaces] = useState<IWorkspace[]>([])
  const [quoreWorkspaceId, setQuoreWorkspaceId] = useState<string>('')

  const deleteRef = useRef<React.ElementRef<typeof ModalDelete>>(null)
  const logoSelectorRef = useRef<React.ElementRef<typeof LogoSelectorDialog>>(null)

  const getWorkspaceDetail = async () => {
    try {
      const response = await fetchApi(
        `${apiUrl}/workspaces/${params.workspace_id}`,
        token!,
        nodeEnv,
      )

      setWorkspace(response)
      setIdentifier(response?.identifier)
      setLocked(response?.locked || false)
      setLogo(JSON.parse(response?.logo || '{}'))
      setQuoreWorkspaceId(response?.quore_workspace_id)
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const getQuoreWorkspaces = async () => {
    try {
      const response = await fetchApi(`${quoreApiUrl}/workspaces`, token!, nodeEnv)

      setQuoreWorkspaces(response.data)
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoadingQuoreWorkspaces(false)
    }
  }

  const onRemoveError = (fieldName: string, value?: string) => {
    setErrorFields((prev: any) => ({
      ...prev,
      [fieldName]: value ? null : `${fieldName} is required`,
    }))
  }

  const onCopy = (workspaceId: string) => {
    setCopied(true)

    navigator.clipboard.writeText(workspaceId)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  useEffect(() => {
    if (token) {
      getWorkspaceDetail()
      getQuoreWorkspaces()
    }
  }, [token])

  useEffect(() => {
    if (actionData?.errors) {
      setErrorFields(actionData.errors)
    }

    if (actionData?.success) {
      getWorkspaceDetail()
      toast.success(actionData.message)
    }
  }, [actionData])

  if (isLoading) {
    return <AppPreloader />
  }

  return (
    <div className="flex w-full animate-slide-up flex-col items-center gap-5">
      <FormWrapper
        title="Edit Workspace"
        submitText="Update"
        method="PUT"
        isSubmitting={navigation.state === 'submitting'}
        hiddenInputs={{
          token: token || '',
          workspace_id: params.workspace_id || '',
          logo: JSON.stringify(logo),
        }}>
        <div className="mb-3">
          <Label>ID</Label>
          <div className="flex items-center justify-between rounded border border-input bg-muted px-3 py-1">
            <p>{workspace?.id}</p>
            <Button
              variant="secondary"
              size="xs"
              onClick={() => onCopy(workspace?.id || '')}>
              {copied ? (
                <>
                  <Check /> Copied
                </>
              ) : (
                <>
                  <Copy />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        <FormField
          label="Name"
          name="name"
          required
          autoFocus
          defaultValue={workspace?.name}
          error={errorFields?.name}
          onChange={(value) => {
            const identifierValue = formatString('kebab-case', value)
            setIdentifier(identifierValue)

            onRemoveError('name', value)
          }}
        />

        <FormField
          label="Identifier"
          name="identifier"
          required
          value={identifier}
          onChange={(value) => {
            const identifierValue = formatString('kebab-case', value)
            setIdentifier(identifierValue)

            onRemoveError('identifier', value)
          }}
        />

        <FormField
          label="Description"
          name="description"
          type="textarea"
          defaultValue={workspace?.description}
        />

        <FormSelect
          label="Quore Workspace"
          name="quore_workspace_id"
          loading={isLoadingQuoreWorkspaces}
          value={quoreWorkspaceId}
          onValueChange={setQuoreWorkspaceId}
          options={quoreWorkspaces.map((workspace) => ({
            label: workspace.name,
            value: workspace.id,
          }))}
        />

        <div className="mb-3">
          <Label>Logo</Label>
          <div className="flex items-center justify-between rounded border border-input p-3">
            <div className="flex items-center gap-3">
              <Avatar
                name={logo?.name || avatarName}
                variant={(logo?.variant as any) || 'beam'}
                size={40}
                colors={logo?.colors || avatarColors[0]}
              />
              <div>
                <div className="mb-0.5 text-sm font-medium capitalize">
                  {logo?.variant || 'beam'}
                </div>
                <div className="flex items-center">
                  {logo?.colors.map((bgColor, idx) => (
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
              onClick={() => logoSelectorRef.current?.onOpen(logo!)}>
              <Edit3 size={14} className="mr-2" />
              Customize
            </Button>
          </div>
        </div>

        <div className="mb-5">
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

      <div className="coreui-content-center">
        <Card className="coreui-card-center border border-destructive">
          <CardHeader>
            <CardTitle className="text-xl text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="flex items-start justify-start gap-2 rounded-md border border-destructive p-3">
              <TriangleAlert size={18} className="text-destructive" />
              <div>
                <h3 className="text-sm+ font-semibold text-destructive">
                  Warning: Destructive Action
                </h3>
                <p className="text-destructive">
                  Once you delete a workspace, there is no going back. Please be certain.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-destructive bg-red-50 py-2.5 dark:bg-red-950">
            <Button
              variant="destructive"
              disabled={workspace?.locked}
              onClick={() => deleteRef.current?.onOpen()}>
              Delete
            </Button>
          </CardFooter>
        </Card>
      </div>

      <ModalDelete
        ref={deleteRef}
        alert="Workspace"
        title={`Delete "${workspace?.name}" workspace?`}
        data={{
          workspace_id: params.workspace_id,
          token: token,
          name: workspace?.name,
        }}
      />

      <LogoSelectorDialog ref={logoSelectorRef} onLogoChange={setLogo} />
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const formData = await request.formData()
  const {
    name,
    description,
    identifier,
    locked,
    token,
    workspace_id,
    logo,
    quore_workspace_id,
  } = Object.fromEntries(formData)

  const url = `${apiUrl}/workspaces/${workspace_id}`

  if (request.method === 'PUT') {
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
      const payload = {
        name: name.toString(),
        description: description.toString(),
        identifier: identifier.toString(),
        locked: locked === 'on',
        quore_workspace_id: quore_workspace_id.toString(),
        logo,
      }

      await fetchApi(url, token.toString(), nodeEnv, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })

      return { success: true, message: 'Successfully updated workspace' }
    } catch (error: any) {
      const convertError = JSON.parse(error?.message)

      return redirectWithToast(
        convertError.status === 401 ? '/logout' : `/workspaces/${workspace_id}/settings`,
        {
          type: 'error',
          title: 'Error',
          description: `${convertError.status} - ${convertError.error}`,
        },
      )
    }
  }

  if (request.method === 'DELETE') {
    try {
      await fetchApi(url, token.toString(), nodeEnv, {
        method: 'DELETE',
      })

      return redirectWithToast(`/workspaces`, {
        type: 'success',
        title: 'Success',
        description: `Workspace ${name} deleted successfully`,
      })
    } catch (error: any) {
      const convertError = JSON.parse(error?.message)

      return redirectWithToast(
        convertError.status === 401 ? '/logout' : `/workspaces/${workspace_id}/settings`,
        {
          type: 'error',
          title: 'Error',
          description: `${convertError.status} - ${convertError.error}`,
        },
      )
    }
  }
}
