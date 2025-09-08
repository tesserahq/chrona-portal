import Assistant from '@/components/misc/Assistant/Assistant'
import { useLoaderData } from '@remix-run/react'

export function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function ProjectAssistant() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()

  return <Assistant apiUrl={apiUrl!} nodeEnv={nodeEnv} />
}
