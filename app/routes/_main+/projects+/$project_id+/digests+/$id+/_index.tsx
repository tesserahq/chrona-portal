/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import ModalDelete from '@/components/misc/Dialog/DeleteConfirmation'
import EntryInformation from '@/components/misc/Dialog/EntryInformation'
import { DigestView } from '@/components/misc/DigestView'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi } from '@/libraries/fetch'
import { IDigest } from '@/types/digest'
import { redirectWithToast } from '@/utils/toast.server'
import { ActionFunctionArgs } from '@remix-run/node'
import { useLoaderData, useNavigate, useParams } from '@remix-run/react'
import { Edit, EllipsisVertical, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function DigestDetailPage() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const params = useParams()
  const navigate = useNavigate()
  const { token } = useApp()
  const handleApiError = useHandleApiError()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [digest, setDigest] = useState<IDigest | null>(null)
  const entryRef = useRef<React.ElementRef<typeof EntryInformation>>(null)
  const deleteRef = useRef<any>(null)

  const fetchDigest = async () => {
    setIsLoading(true)

    try {
      const url = `${apiUrl}/digests/${params.id}?include=entries`
      const response: IDigest = await fetchApi(url, token!, nodeEnv)

      setDigest(response)
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (params.id && token) {
      fetchDigest()
    }
  }, [params.id, token])

  if (isLoading) {
    return <AppPreloader />
  }

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
          className="flex w-full justify-start"
          onClick={() =>
            navigate(`/projects/${params.project_id}/digests/${params.id}/edit`)
          }>
          <Edit />
          <span>Edit</span>
        </Button>
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
      <DigestView
        digest={digest}
        onEntryClick={(entry) => entryRef.current?.onOpen(entry)}
        showActions={true}
        actions={actions}
      />

      <ModalDelete
        ref={deleteRef}
        alert="Digest"
        title={`Remove "${digest?.title}" from digests`}
        data={{
          project_id: params.project_id,
          id: digest?.id,
          token: token!,
        }}
      />

      <EntryInformation ref={entryRef} />
    </>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const formData = await request.formData()

  const { token, id, project_id } = Object.fromEntries(formData)

  try {
    if (request.method === 'DELETE') {
      const url = `${apiUrl}/digests/${id}`

      await fetchApi(url, token as string, nodeEnv, {
        method: 'DELETE',
      })

      return redirectWithToast(`/projects/${project_id}/digests`, {
        type: 'success',
        title: 'Success',
        description: 'Digest deleted successfully',
      })
    }
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(`/projects/${project_id}/digests`, {
      type: 'error',
      title: 'Error',
      description: `${convertError.status} - ${convertError.error}`,
    })
  }
}
