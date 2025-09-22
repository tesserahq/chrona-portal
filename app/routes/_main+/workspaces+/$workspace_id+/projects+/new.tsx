/* eslint-disable @typescript-eslint/no-explicit-any */
import JSONEditor from '@/components/misc/JsonEditor'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent } from '@/components/ui/card'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { getQuoreWorkspaceID } from '@/libraries/storage'
import { projectSchema } from '@/schemas/project'
import { IQuoreProject } from '@/types/quore'
import { redirectWithToast } from '@/utils/toast.server'
import { ActionFunctionArgs } from '@remix-run/node'
import {
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useParams,
} from '@remix-run/react'
import { FormField, FormSelect, FormWrapper } from 'core-ui'
import { useEffect, useState } from 'react'

export function loader() {
  const quoreApiUrl = process.env.QUORE_API_URL
  const nodeEnv = process.env.NODE_ENV

  return { quoreApiUrl, nodeEnv }
}

export default function ProjectNew() {
  const { quoreApiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const params = useParams()
  const navigate = useNavigate()
  const handleApiError = useHandleApiError()
  const { token } = useApp()
  const [labels, setLabels] = useState<string>('')
  const [errorFields, setErrorFields] = useState<any>()
  const [quoreProjects, setQuoreProjects] = useState<IQuoreProject[]>([])
  const [quoreProjectId, setQuoreProjectId] = useState<string>('')
  const [isLoadingProject, setIsLoadingProject] = useState<boolean>(true)

  const onCancel = () => {
    navigate(`/workspaces/${params.workspace_id}/projects`, { replace: true })
  }

  const fetchProjects = async (quoreWorkspaceId: string) => {
    setIsLoadingProject(true)

    try {
      const response = await fetchApi(
        `${quoreApiUrl}/workspaces/${quoreWorkspaceId}/projects`,
        token!,
        nodeEnv,
      )

      setQuoreProjects(response.data)
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoadingProject(false)
    }
  }

  useEffect(() => {
    if (actionData?.errors) {
      setErrorFields(actionData.errors)
    }
  }, [actionData])

  useEffect(() => {
    const quoreWorkspaceId = getQuoreWorkspaceID()

    if (token && quoreWorkspaceId) {
      fetchProjects(quoreWorkspaceId)
    }
  }, [token])

  return (
    <FormWrapper
      method="POST"
      title="Create Project"
      isSubmitting={navigation.state === 'submitting'}
      onCancel={onCancel}
      hiddenInputs={{
        token: token!,
        workspace_id: params.workspace_id || '',
        labels: labels,
      }}>
      <h3 className="mb-3 text-base font-semibold">General</h3>
      <Card className="mb-3 shadow-none">
        <CardContent className="py-5">
          <FormField
            label="Name"
            name="name"
            required
            autoFocus
            error={errorFields?.name}
          />

          <FormField label="Description" name="description" type="textarea" />

          <FormSelect
            label="Quore Project"
            name="quore_project_id"
            value={quoreProjectId}
            loading={isLoadingProject}
            disabled={quoreProjects.length === 0}
            onValueChange={(val) => setQuoreProjectId(val)}
            options={quoreProjects.map((project) => ({
              label: project.name,
              value: project.id,
            }))}
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
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const formData = await request.formData()
  const { name, description, token, workspace_id, labels, quore_project_id } =
    Object.fromEntries(formData)

  const validated = projectSchema.safeParse({
    name,
    description,
    labels: JSON.stringify(labels),
    quore_project_id,
  })

  if (!validated.success) {
    return Response.json({ errors: validated.error.flatten().fieldErrors })
  }

  const url = `${apiUrl}/workspaces/${workspace_id}/projects`

  const payload = {
    name,
    description,
    labels: labels ? JSON.parse(labels as string) : {},
    quore_project_id,
  }

  try {
    const response = await fetchApi(url, token.toString(), nodeEnv, {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    if (response) {
      return redirectWithToast(`/workspaces/${workspace_id}/projects`, {
        title: 'Success',
        description: 'Project created successfully',
        type: 'success',
      })
    }
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(
      convertError.status === 401
        ? '/logout'
        : `/workspaces/${workspace_id}/projects/new`,
      {
        type: 'error',
        title: 'Error',
        description: `${convertError.status} - ${convertError.error}`,
      },
    )
  }
}
