/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppPreloader } from '@/components/misc/AppPreloader'
import { DataTable } from '@/components/misc/Datatable'
import EmptyContent from '@/components/misc/EmptyContent'
import DeleteConfirmation from '@/components/misc/Dialog/DeleteConfirmation'
import { Button } from '@/components/ui/button'
import { fetchApi } from '@/libraries/fetch'
import { ISource } from '@/types/source'
import {
  Link,
  useActionData,
  useLoaderData,
  useNavigate,
  useParams,
} from '@remix-run/react'
import { ColumnDef } from '@tanstack/react-table'
import { Database, Edit, EllipsisVertical, EyeIcon, Plus, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import DatePreview from '@/components/misc/DatePreview'
import { ActionFunctionArgs } from '@remix-run/node'
import { redirectWithToast } from '@/utils/toast.server'
import { toast } from 'sonner'

export function loader() {
  const apiUrl = process.env.API_URL
  const hostUrl = process.env.HOST_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, hostUrl, nodeEnv }
}

export default function SourcesPage() {
  const { nodeEnv, apiUrl } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const { workspace_id } = useParams()
  const { token } = useApp()
  const params = useParams()
  const navigate = useNavigate()
  const handleApiError = useHandleApiError()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [sources, setSources] = useState<ISource[]>([])
  const [sourceDelete, setSourceDelete] = useState<ISource | null>(null)
  const deleteRef = useRef<any>(null)

  const fetchData = async () => {
    setIsLoading(true)

    try {
      const data = await fetchApi(
        `${apiUrl}/workspaces/${workspace_id}/sources`,
        token!,
        nodeEnv,
      )
      setSources(data.data || data)
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token && workspace_id) {
      fetchData()
    }
  }, [token, workspace_id])

  useEffect(() => {
    if (actionData?.success) {
      // show success message
      toast.success(actionData.message)
      // close modal
      deleteRef?.current?.onClose()
      // refresh data
      fetchData()
    }
  }, [actionData])

  const columns: ColumnDef<ISource>[] = [
    {
      accessorKey: 'id',
      header: '',
      size: 5,
      cell: ({ row }) => {
        const { id } = row.original
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button size="icon" variant="ghost">
                <EllipsisVertical />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" side="right" className="w-44 p-2">
              <Button
                variant="ghost"
                className="flex w-full justify-start"
                onClick={() =>
                  navigate(`/workspaces/${params.workspace_id}/sources/${id}`)
                }>
                <EyeIcon />
                <span>View</span>
              </Button>
              <Button
                variant="ghost"
                className="flex w-full justify-start"
                onClick={() => {
                  navigate(`/workspaces/${params.workspace_id}/sources/${id}/edit`)
                }}>
                <Edit />
                <span>Edit</span>
              </Button>
              <Button
                variant="ghost"
                className="flex w-full justify-start hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => {
                  deleteRef.current?.onOpen()
                  setSourceDelete(row.original)
                }}>
                <Trash2 />
                <span>Delete</span>
              </Button>
            </PopoverContent>
          </Popover>
        )
      },
    },
    {
      accessorKey: 'name',
      header: 'Name',
      size: 400,
      cell: ({ row }) => {
        const { name, description, id } = row.original
        return (
          <div className="flex items-center gap-2">
            <div className="max-w-[400px]">
              <Link
                to={`/workspaces/${params.workspace_id}/sources/${id}`}
                className="button-link">
                <p className="truncate">{name}</p>
              </Link>
              <p className="truncate text-xs text-muted-foreground">
                {description && description.length > 100
                  ? description.substring(0, 100) + '...'
                  : description}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'identifier',
      header: 'Identifier',
      size: 400,
      cell: ({ row }) => {
        return (
          <div className="max-w-[400px]">
            <span className="text-muted-foreground">{row.original.identifier}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => {
        return <DatePreview label="Created At" date={row.original.created_at} />
      },
    },
    {
      accessorKey: 'updated_at',
      header: 'Updated',
      cell: ({ row }) => {
        return <DatePreview label="Updated At" date={row.original.updated_at} />
      },
    },
  ]

  if (isLoading) {
    return <AppPreloader />
  }

  return (
    <div className="h-full animate-slide-up">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-foreground">Sources</h1>
        <Button onClick={() => navigate(`/workspaces/${workspace_id}/sources/new`)}>
          New Source
        </Button>
      </div>

      {sources.length === 0 ? (
        <EmptyContent
          image="/images/empty-document.png"
          title="No sources yet"
          description="Create your first data source to start collecting information">
          <Button
            variant="black"
            onClick={() => navigate(`/workspaces/${workspace_id}/sources/new`)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Source
          </Button>
        </EmptyContent>
      ) : (
        <DataTable
          columns={columns}
          data={sources}
          fixed={false}
          empty={
            <div className="py-8 text-center">
              <Database className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                No sources found
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by creating a new source.
              </p>
            </div>
          }
        />
      )}

      <DeleteConfirmation
        ref={deleteRef}
        alert="Source"
        title={`Delete "${sourceDelete?.name}" source?`}
        data={{
          workspace_id: params.workspace_id,
          source_id: sourceDelete?.id,
          token: token,
        }}
      />
    </div>
  )
}

export async function action({ request }: ActionFunctionArgs) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const formData = await request.formData()

  const { workspace_id, source_id, token } = Object.fromEntries(formData)

  try {
    if (request.method === 'DELETE') {
      const url = `${apiUrl}/sources/${source_id}`

      await fetchApi(url, token as string, nodeEnv, {
        method: 'DELETE',
      })

      return { success: true, message: `Source deleted successfully` }
    }
  } catch (error: any) {
    const convertError = JSON.parse(error?.message)

    return redirectWithToast(`/workspaces/${workspace_id}/sources`, {
      type: 'error',
      title: 'Error',
      description: `${convertError.status} - ${convertError.error}`,
    })
  }
}
