/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from 'sonner'

export function handleFetcherData(
  data: unknown,
  onSuccess?: (response: any) => void,
  showToast = true,
) {
  if (!data || typeof data !== 'object') {
    // console.warn('Invalid fetcher data:', data)
    return
  }

  const payload = data as {
    toast?: {
      type: 'success' | 'error'
      title: string
      description?: string
    }
    response?: any
    error?: any
  }

  if (payload.toast && showToast) {
    toast[payload.toast.type](payload.toast.description, {
      id: `toast-${Date.now()}`,
      duration: payload.toast.type === 'error' ? 10000 : 3000,
    })
  }

  if (payload.response && onSuccess) {
    onSuccess(payload.response)
  }
}
