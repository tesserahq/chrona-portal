/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/prop-types */
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import Separator from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { fetchApi, NodeENVType } from '@/libraries/fetch'
import { CredentialItem } from '@/routes/_main+/workspaces+/$workspace_id+/credentials+/new'
import { ICredential, ICredentialType } from '@/types/workspace'
import { cn } from '@/utils/misc'
import { useParams } from '@remix-run/react'
import { forwardRef, useImperativeHandle, useState, useCallback, useReducer } from 'react'
import { toast } from 'sonner'

interface FuncProps {
  onOpen: () => void
}

interface IProps {
  callback: (credential: ICredential) => void
  apiUrl: string
  nodeEnv: NodeENVType
  token: string
}

interface FieldError {
  [key: string]: string | null
}

interface Payload {
  name: string
  type: string
  [key: string]: string
}

type FormState = {
  payload: Payload
  errors: FieldError
}

type FormAction =
  | { type: 'SET_FIELD'; key: string; value: string }
  | { type: 'SET_ERRORS'; errors: FieldError }
  | { type: 'RESET'; payload?: Partial<Payload> }

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        payload: { ...state.payload, [action.key]: action.value },
        errors: { ...state.errors, [action.key]: null },
      }
    case 'SET_ERRORS':
      return { ...state, errors: action.errors }
    case 'RESET':
      return {
        payload: { name: '', type: '', ...action.payload },
        errors: {},
      }
    default:
      return state
  }
}

const DialogFormCredential: React.ForwardRefRenderFunction<FuncProps, IProps> = (
  { callback, apiUrl, nodeEnv, token },
  ref,
) => {
  const params = useParams()
  const [open, setOpen] = useState(false)
  const [credentialTypes, setCredentialTypes] = useState<ICredentialType[]>([])
  const [selectedCredentialType, setSelectedCredentialType] = useState<ICredentialType>()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fields, setFields] = useState<{ name: string; required: boolean }[]>([])

  const [formState, dispatch] = useReducer(formReducer, {
    payload: { name: '', type: '' },
    errors: {},
  })

  const { payload, errors } = formState

  useImperativeHandle(ref, () => ({
    onOpen() {
      setOpen(true)
      setIsLoading(true)
      getCredentialTypes()
      setSelectedCredentialType(undefined)
      dispatch({ type: 'RESET' })
    },
  }))

  const getCredentialTypes = useCallback(async () => {
    try {
      const response = await fetchApi(
        `${apiUrl}/workspaces/${params.workspace_id}/credentials/types`,
        token,
        nodeEnv,
      )
      setCredentialTypes(response)
    } catch (error: any) {
      const err = JSON.parse(error?.message || '{}')
      toast.error(`${err.status} - ${err.error}`)
    } finally {
      setIsLoading(false)
    }
  }, [apiUrl, params.workspace_id, token, nodeEnv])

  const handleSelectType = (value: string) => {
    const credentialType = credentialTypes.find((cred) => cred.type_name === value)
    if (!credentialType) return

    setSelectedCredentialType(credentialType)

    setFields(
      credentialType.fields.map((field) => ({
        name: field.name,
        required: field.required,
      })),
    )

    const defaultFields = Object.fromEntries(
      credentialType.fields.map((f) => [f.name, '']),
    )

    dispatch({
      type: 'RESET',
      payload: { ...formState.payload, ...defaultFields, type: credentialType.type_name },
    })
  }

  const validateForm = (): boolean => {
    const newErrors: FieldError = {}

    if (!payload.name?.trim()) newErrors.name = 'Name is required'
    if (!payload.type?.trim()) newErrors.type = 'Type is required'

    for (const field of fields) {
      const value = payload[field.name]
      if (field.required && !value?.trim()) {
        const errorMessage = `${field.name.split('_').join(' ')} is required`

        newErrors[field.name] =
          errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1)
      }
    }

    if (Object.keys(newErrors).length > 0) {
      dispatch({ type: 'SET_ERRORS', errors: newErrors })
      return false
    }
    return true
  }

  const onSave = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    const additionalFields = Object.fromEntries(
      fields.map(({ name }) => [name, payload[name]]),
    )

    const payloadSend = {
      name: payload.name,
      type: payload.type,
      fields: additionalFields,
    }

    try {
      const credential: ICredential = await fetchApi(
        `${apiUrl}/workspaces/${params.workspace_id}/credentials`,
        token,
        nodeEnv,
        { method: 'POST', body: JSON.stringify(payloadSend) },
      )
      callback(credential)
      setOpen(false)
    } catch (error: any) {
      const err = JSON.parse(error?.message || '{}')
      toast.error(`${err.status} - ${err.error}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[90%] !max-w-full lg:w-[700px]">
        <DialogHeader>
          <DialogTitle>Create Credential</DialogTitle>
        </DialogHeader>

        {/* Name */}
        <div>
          <Label className="required">Name</Label>
          <Input
            autoFocus
            value={payload.name}
            onChange={(e) =>
              dispatch({ type: 'SET_FIELD', key: 'name', value: e.target.value })
            }
            className={cn(errors.name && 'input-error')}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        {/* Type */}
        <div className="mb-1">
          <Label className="required">Type</Label>
          <Select
            name="type"
            value={payload.type}
            onValueChange={handleSelectType}
            disabled={isLoading}>
            <SelectTrigger className={cn(errors.type && 'input-error')}>
              {isLoading ? (
                'Loading...'
              ) : (
                <div className="flex items-center gap-2">
                  {selectedCredentialType && <CredentialItem type={payload.type} />}
                  <span className="capitalize">
                    {selectedCredentialType?.display_name || 'None'}
                  </span>
                </div>
              )}
            </SelectTrigger>
            <SelectContent>
              {credentialTypes.length === 0 ? (
                <SelectItem value="none" className="text-muted-foreground">
                  Not Found
                </SelectItem>
              ) : (
                credentialTypes.map((cred) => (
                  <SelectItem value={cred.type_name} key={cred.type_name}>
                    <CredentialItem type={cred.type_name} name={cred.display_name} />
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.type && <span className="error-message">{errors.type}</span>}
        </div>

        {/* Dynamic Fields */}
        {selectedCredentialType?.fields.length ? (
          <Separator orientation="horizontal" />
        ) : null}
        {selectedCredentialType?.fields.map((field) => (
          <div key={field.name} className="mb-1">
            <Label className={cn(field.required && 'required')}>{field.label}</Label>
            {field.input_type === 'textarea' ? (
              <Textarea
                name={field.name}
                value={payload[field.name] || ''}
                className={cn(errors[field.name] && 'input-error')}
                onChange={(e) =>
                  dispatch({ type: 'SET_FIELD', key: field.name, value: e.target.value })
                }
              />
            ) : (
              <Input
                type={field.input_type}
                name={field.name}
                value={payload[field.name] || ''}
                className={cn(errors[field.name] && 'input-error')}
                onChange={(e) =>
                  dispatch({ type: 'SET_FIELD', key: field.name, value: e.target.value })
                }
              />
            )}
            {errors[field.name] ? (
              <span className="error-message">{errors[field.name]}</span>
            ) : (
              <span className="mt-1 block text-xs text-slate-400">{field.help}</span>
            )}
          </div>
        ))}

        {/* Footer */}
        <DialogFooter className="mt-5 flex justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button disabled={isLoading || isSubmitting} onClick={onSave}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default forwardRef(DialogFormCredential)
