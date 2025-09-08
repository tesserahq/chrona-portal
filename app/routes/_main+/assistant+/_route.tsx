import Assistant from '@/components/misc/Assistant/Assistant'
import { useLoaderData } from '@remix-run/react'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  const identiesHostUrl = process.env.IDENTIES_HOST_URL

  return { apiUrl, nodeEnv, identiesHostUrl }
}

export default function ProjectAssistant() {
  const { apiUrl, nodeEnv, identiesHostUrl } = useLoaderData<typeof loader>()

  return (
    <Assistant
      assistantMode
      apiUrl={apiUrl!}
      nodeEnv={nodeEnv}
      identiesHostUrl={identiesHostUrl!}
    />
  )
}
