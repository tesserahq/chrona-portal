/* eslint-disable @typescript-eslint/no-explicit-any */
import { useApp } from '@/context/AppContext'
import { fetchApi } from '@/libraries/fetch'
import { sourceSchema } from '@/schemas/source'
import { formatString } from '@/utils/format-string'
import { redirectWithToast } from '@/utils/toast.server'
import { ActionFunctionArgs } from '@remix-run/node'
import { useActionData, useNavigate, useNavigation, useParams } from '@remix-run/react'
import { FormField, FormWrapper } from 'core-ui'
import { useEffect, useState } from 'react'

export default function SourceCreate() {
  const actionData = useActionData<typeof action>()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const { token } = useApp()
  const { workspace_id } = useParams()
  const [errorFields, setErrorFields] = useState<any>()
  const [identifier, setIdentifier] = useState<string>('')

  const onCancel = () =>
    navigate(`/workspaces/${workspace_id}/sources`, { replace: true })

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
    <FormWrapper
      method="POST"
      title="Create Source"
      onCancel={onCancel}
      isSubmitting={navigation.state === 'submitting'}
      hiddenInputs={{
        token: token!,
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
      <FormField
        label="Description"
        name="description"
        type="textarea"
        error={errorFields?.description}
        onChange={(value) => onRemoveError('description', value)}
      />
    </FormWrapper>
  )
}

export async function action({ request, params }: ActionFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const formData = await request.formData()
  const { name, description, identifier, token } = Object.fromEntries(formData)

  const validated = sourceSchema.safeParse({
    name,
    description,
    identifier,
  })

  if (!validated.success) {
    return Response.json({ errors: validated.error.flatten().fieldErrors })
  }

  try {
    await fetchApi(
      `${apiUrl}/workspaces/${params.workspace_id}/sources`,
      token.toString(),
      nodeEnv,
      {
        method: 'POST',
        body: JSON.stringify({
          name: name.toString(),
          description: description.toString(),
          identifier: identifier.toString(),
        }),
      },
    )

    return redirectWithToast(`/workspaces/${params.workspace_id}/sources`, {
      type: 'success',
      title: 'Success',
      description: 'Successfully created source',
    })
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(
      convertError.status === 401
        ? '/logout'
        : `/workspaces/${params.workspace_id}/sources/new`,
      {
        type: 'error',
        title: 'Error',
        description: `${convertError.status} - ${convertError.error}`,
      },
    )
  }
}
