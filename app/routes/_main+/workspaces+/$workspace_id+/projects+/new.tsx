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
import { fetchApi } from '@/libraries/fetch'
import { projectSchema } from '@/schemas/project'
import { redirectWithToast } from '@/utils/toast.server'
import { ActionFunctionArgs } from '@remix-run/node'
import { useActionData, useNavigate, useNavigation, useParams } from '@remix-run/react'
import { FormField, FormWrapper } from 'core-ui'
import { useEffect, useState } from 'react'

export default function ProjectNew() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const params = useParams()
  const navigate = useNavigate()
  const { token } = useApp()
  const [labels, setLabels] = useState<string>('')
  const [errorFields, setErrorFields] = useState<any>()

  const onCancel = () => {
    navigate(`/workspaces/${params.workspace_id}/projects`, { replace: true })
  }

  useEffect(() => {
    if (actionData?.errors) {
      setErrorFields(actionData.errors)
    }
  }, [actionData])

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
      <Card className="mb-3">
        <CardContent className="border border-input py-5">
          <FormField
            label="Name"
            name="name"
            required
            autoFocus
            error={errorFields?.name}
          />
          <FormField label="Description" name="description" type="textarea" />
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
  const { name, description, token, workspace_id, labels } = Object.fromEntries(formData)

  const validated = projectSchema.safeParse({
    name,
    description,
  })

  if (!validated.success) {
    return Response.json({ errors: validated.error.flatten().fieldErrors })
  }

  const url = `${apiUrl}/workspaces/${workspace_id}/projects`

  const payload = {
    name,
    description,
    labels: labels ? JSON.parse(labels as string) : {},
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

    // if (convertError?.status === 422) {
    // let errors: any

    // { name: [ 'Name is required' ] }
    // convertError.error.forEach((err) => {
    //   errors = { ...errors, [err.loc[2]]: `${err.loc[2]} ${err.msg}` }
    // })

    // console.log('errors ', errors)

    // return Response.json({ errors })
    // }

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
