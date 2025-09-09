/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import ModalDelete from '@/components/misc/Dialog/DeleteConfirmation'
import JSONEditor from '@/components/misc/JsonEditor'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { getWorkspaceID } from '@/libraries/storage'
import { projectSchema } from '@/schemas/project'
import { IProject } from '@/types/project'
import { redirectWithToast } from '@/utils/toast.server'
import { ActionFunctionArgs } from '@remix-run/node'
import { useActionData, useLoaderData, useNavigation, useParams } from '@remix-run/react'
import { FormField, FormWrapper } from 'core-ui'
import { Check, Copy, TriangleAlert } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export function loader() {
  return {
    apiUrl: process.env.API_URL,
    nodeEnv: process.env.NODE_ENV,
  }
}

export default function ProjectSetting() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const params = useParams()
  const navigation = useNavigation()
  const { token } = useApp()
  const [project, setProject] = useState<IProject>()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [copied, setCopied] = useState<boolean>(false)
  const [errorFields, setErrorFields] = useState<any>()
  const handleApiError = useHandleApiError()
  const [labels, setLabels] = useState<string>('')

  const deleteRef = useRef<React.ElementRef<typeof ModalDelete>>(null)

  const getProjectDetail = async () => {
    try {
      const response: IProject = await fetchApi(
        `${apiUrl}/projects/${params.project_id}`,
        token!,
        nodeEnv,
      )

      setProject(response)
      setLabels(JSON.stringify(response.labels ? response.labels : {}))
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const onCopy = (workspaceId: string) => {
    setCopied(true)

    navigator.clipboard.writeText(workspaceId)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  useEffect(() => {
    if (actionData?.errors) {
      setErrorFields(actionData.errors)
    }
  }, [actionData])

  useEffect(() => {
    if (token) {
      getProjectDetail()
    }
  }, [token])

  if (isLoading) {
    return <AppPreloader />
  }

  return (
    <div className="flex w-full animate-slide-up flex-col items-center gap-5">
      <FormWrapper
        method="PUT"
        title="Edit Project"
        className="border border-input"
        isSubmitting={navigation.state === 'submitting'}
        hiddenInputs={{
          // Hidden inputs are required because closed accordions prevent the form from reading field values.
          token: token!,
          project_id: params.project_id || '',
          workspace_id: getWorkspaceID() || '',

          // labels
          labels: labels,
        }}>
        <div className="mb-3">
          <Label>ID</Label>
          <div className="flex items-center justify-between rounded border border-input bg-muted px-3 py-1">
            <p>{project?.id}</p>
            <Button
              variant="secondary"
              size="xs"
              type="button"
              onClick={() => onCopy(project?.id || '')}>
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

        <h3 className="mb-3 text-base font-semibold">General</h3>
        <Card className="mb-3">
          <CardContent className="border border-input py-5">
            <FormField
              label="Name"
              name="name"
              required
              autoFocus
              defaultValue={project?.name}
              error={errorFields?.name}
            />
            <FormField
              label="Description"
              name="description"
              type="textarea"
              defaultValue={project?.description}
            />
          </CardContent>
        </Card>

        <Accordion type="multiple">
          <AccordionItem value="labels">
            <AccordionTrigger>
              <h3 className="text-base font-semibold">Labels</h3>
            </AccordionTrigger>
            <AccordionContent>
              <JSONEditor title="label" onChange={setLabels} currentData={labels} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </FormWrapper>

      <div className="coreui-content-center">
        <Card className="coreui-card-center w-full border border-destructive lg:w-1/2">
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
            <Button variant="destructive" onClick={() => deleteRef.current?.onOpen()}>
              Delete
            </Button>
          </CardFooter>
        </Card>
      </div>

      <ModalDelete
        ref={deleteRef}
        alert="Project"
        title={`Delete "${project?.name}" project?`}
        data={{
          workspace_id: getWorkspaceID(),
          project_id: params.project_id,
          token: token,
          name: project?.name,
        }}
      />
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const formData = await request.formData()
  const { project_id, name, description, token, workspace_id, labels } =
    Object.fromEntries(formData)

  const url = `${apiUrl}/projects/${project_id}`

  if (request.method === 'PUT') {
    const validated = projectSchema.safeParse({
      name,
      description,
    })

    if (!validated.success) {
      return Response.json({ errors: validated.error.flatten().fieldErrors })
    }

    const payload = {
      name,
      description,
      labels: labels ? JSON.parse(labels as string) : {},
    }

    try {
      const response = await fetchApi(url, token.toString(), nodeEnv, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })

      return redirectWithToast(`/projects/${response.id}/settings`, {
        type: 'success',
        title: 'Success',
        description: 'Project updated successfully',
      })
    } catch (error: any) {
      const convertError = JSON.parse(error?.message)

      return redirectWithToast(
        convertError.status === 401 ? '/logout' : `/projects/${project_id}/settings`,
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

      return redirectWithToast(`/workspaces/${workspace_id}/projects`, {
        type: 'success',
        title: 'Success',
        description: `Projects ${name} deleted successfully`,
      })
    } catch (error: any) {
      const convertError = JSON.parse(error?.message)

      return redirectWithToast(
        convertError.status === 401 ? '/logout' : `/projects/${project_id}/settings`,
        {
          type: 'error',
          title: 'Error',
          description: `${convertError.status} - ${convertError.error}`,
        },
      )
    }
  }
}
