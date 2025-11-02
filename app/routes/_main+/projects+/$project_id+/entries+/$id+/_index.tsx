/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import ModalDelete from '@/components/misc/Dialog/DeleteConfirmation'
import { EntryView } from '@/components/misc/EntryView'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { IEntry } from '@/types/entry'
import { redirectWithToast } from '@/utils/toast.server'
import { ActionFunctionArgs } from '@remix-run/node'
import { useActionData, useLoaderData, useNavigate, useParams } from '@remix-run/react'
import { EllipsisVertical, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function EntryDetailPage() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const params = useParams()
  const navigate = useNavigate()
  const { token } = useApp()
  const handleApiError = useHandleApiError()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [entry, setEntry] = useState<IEntry | null>(null)
  const deleteRef = useRef<React.ElementRef<typeof ModalDelete>>(null)

  const fetchEntry = async () => {
    setIsLoading(true)

    try {
      const url = `${apiUrl}/entries/${params.id}`
      const response = await fetchApi(url, token!, nodeEnv)

      setEntry(response)
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchEntry()
    }
  }, [params.id])

  useEffect(() => {
    if (actionData?.success) {
      // show success message
      toast.success(actionData.message)
      // close modal
      deleteRef?.current?.onClose()
      // redirect to entries list
      navigate(`/projects/${params.project_id}/entries`)
    }
  }, [actionData, navigate, params.project_id])

  if (isLoading) return <AppPreloader />

  const actions = (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost">
          <EllipsisVertical />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" side="left" className="w-44 p-2">
        <Button
          variant="ghost"
          className="flex w-full justify-start hover:bg-destructive hover:text-destructive-foreground"
          onClick={() => {
            deleteRef.current?.onOpen()
          }}>
          <Trash2 />
          <span>Delete</span>
        </Button>
      </PopoverContent>
    </Popover>
  )

  return (
    <>
      <div className="mb-5 flex animate-slide-up items-center justify-between gap-5">
        <h1 className="text-balance text-xl font-bold text-foreground lg:text-2xl">
          {entry?.title}
        </h1>
        {actions}
      </div>

      <EntryView entry={entry} />

      <ModalDelete
        ref={deleteRef}
        title="Remove Entry"
        description={`This will remove "${entry?.title}" from your entries. This action cannot be undone.`}
        data={{
          project_id: params.project_id,
          id: entry?.id,
          token: token!,
        }}
      />
    </>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const formData = await request.formData()

  const { project_id, token, id } = Object.fromEntries(formData)

  try {
    if (request.method === 'DELETE') {
      const url = `${apiUrl}/entries/${id}`

      await fetchApi(url, token as string, nodeEnv, {
        method: 'DELETE',
      })

      return { success: true, message: `Entry deleted successfully` }
    }
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(`/projects/${project_id}/entries`, {
      type: 'error',
      title: 'Error',
      description: `${convertError.status} - ${convertError.error}`,
    })
  }
}
