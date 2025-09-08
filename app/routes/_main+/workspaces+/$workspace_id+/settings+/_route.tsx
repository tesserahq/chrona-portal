/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import ModalDelete from '@/components/misc/DeleteConfirmation'
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
import {
  avatarColors,
  avatarName,
  avatarVariants,
  IWorkspace,
  IWorkspaceLogo,
} from '@/types/workspace'
import { formatString } from '@/utils/format-string'
import { cn } from '@/utils/misc'
import { redirectWithToast } from '@/utils/toast.server'
import { ActionFunctionArgs } from '@remix-run/node'
import { useActionData, useLoaderData, useNavigation, useParams } from '@remix-run/react'
import Avatar from 'boring-avatars'
import { FormField, FormWrapper } from 'core-ui'
import { Check, Copy, TriangleAlert } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export function loader() {
  return {
    apiUrl: process.env.API_URL,
    nodeEnv: process.env.NODE_ENV,
  }
}

export default function WorkspaceSetting() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const params = useParams()
  const navigation = useNavigation()
  const handleApiError = useHandleApiError()
  const [workspace, setWorkspace] = useState<IWorkspace>()
  const { token } = useApp()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const deleteRef = useRef<React.ElementRef<typeof ModalDelete>>(null)
  const [errorFields, setErrorFields] = useState<any>()
  const [identifier, setIdentifier] = useState<string>('')
  const [locked, setLocked] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)
  const [logo, setLogo] = useState<IWorkspaceLogo>()

  const getWorkspaceDetail = async () => {
    try {
      const response = await fetchApi(
        `${apiUrl}/workspaces/${params.workspace_id}`,
        token!,
        nodeEnv,
      )

      setWorkspace(response)
      setIdentifier(response.identifier)
      setLocked(response.locked || false)
      setLogo(JSON.parse(response.logo || '{}'))
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
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
    if (token) getWorkspaceDetail()
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

        <div className="mb-3">
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
                    JSON.stringify(logo?.colors) === JSON.stringify(colors) &&
                      'border-primary',
                  )}
                  onClick={() => setLogo({ ...logo, colors } as IWorkspaceLogo)}>
                  {colors.map((bgColor, idx) => (
                    <div
                      key={idx}
                      style={{ background: bgColor }}
                      className={`h-10 w-5`}></div>
                  ))}
                  {JSON.stringify(logo?.colors) === JSON.stringify(colors) && (
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
                  onClick={() => setLogo({ ...logo, variant: type } as IWorkspaceLogo)}>
                  <Avatar
                    name={logo?.name || avatarName}
                    size={40}
                    variant={type as any}
                    colors={logo?.colors as any}
                  />
                  <span
                    className={cn(
                      'text-xs text-muted-foreground',
                      logo?.variant === type && 'font-medium text-primary',
                    )}>
                    {type}
                  </span>
                </div>
              ))}
            </div>

            {/* Preview */}
            <div className="mt-5 flex w-full flex-col items-center justify-center">
              <Avatar
                name={logo?.name || avatarName}
                variant={logo?.variant as any}
                size={150}
                colors={logo?.colors as any}
              />
              <div className="mb-3 mt-2 text-xs text-muted-foreground">Preview</div>
            </div>
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
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const formData = await request.formData()
  const { name, description, identifier, locked, token, workspace_id, logo } =
    Object.fromEntries(formData)

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
