/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi, NodeENVType } from '@/libraries/fetch'
import { forwardRef, useImperativeHandle, useState } from 'react'
import { AppPreloader } from '../AppPreloader'
import { useApp } from '@/context/AppContext'

interface ISystemSettings {
  app: {
    name: string
    environment: string
    log_level: string
    disable_auth: boolean
    port: number
  }
  llm: {
    default_provider: string
    default_llm: string
    default_embed_model: string
    default_embed_dim: number
    default_system_prompt: string
    ollama_base_url: string
  }
  data: {
    default_data_dir: string
    database_host: string
    database_driver: string
    is_production: boolean
    is_test: boolean
  }
  telemetry: {
    otel_enabled: boolean
    otel_exporter_otlp_endpoint: string
    otel_service_name: string
  }
  redis: {
    host: string
    port: number
    namespace: string
  }
  services: {
    vaulta_api_url: string
    identies_host: string
  }
}

interface FuncProps {
  onOpen: () => void
}

interface IProps {
  apiUrl: string
  nodeEnv: NodeENVType
}

const DialogSystemSettings: React.ForwardRefRenderFunction<FuncProps, IProps> = (
  { apiUrl, nodeEnv }: IProps,
  ref,
) => {
  const { token } = useApp()
  const handleApiError = useHandleApiError()
  const [open, setOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [systemSettings, setSystemSettings] = useState<ISystemSettings>()

  useImperativeHandle(ref, () => ({
    onOpen() {
      setOpen(true)
      onGetSystemSetting()
    },
  }))

  const onGetSystemSetting = async () => {
    setIsLoading(true)
    try {
      const response = await fetchApi(`${apiUrl}/system/settings`, token!, nodeEnv)

      setSystemSettings(response.data)
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const convert = (str: string) => {
    return str
      .split('_') // split by underscore
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // capitalize first letter
      .join(' ') // join with space
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-3xl max-h-[90%] max-w-2xl overflow-auto">
        <DialogHeader className="mb-3">
          <DialogTitle>System Settings</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <AppPreloader />
        ) : (
          <div className="h-full overflow-auto">
            {Object.entries(systemSettings || {}).map(([key, children]) => {
              return (
                <Card key={key} className="mb-2">
                  <CardHeader className="mb-1 py-3">
                    <h5 className="font-semibold capitalize">{key}</h5>
                  </CardHeader>
                  <CardContent className="d-list px-6">
                    {Object.entries(children).map(([child_key, child_value]) => {
                      return (
                        <div key={child_key} className="d-item">
                          <dt className="d-label w-52 dark:font-light">
                            {convert(child_key)}
                          </dt>
                          <dd className="d-content">{child_value as any}</dd>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default forwardRef(DialogSystemSettings)
