/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApp } from '@/context/AppContext'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { fetchApi, NodeENVType } from '@/libraries/fetch'
import { IGazette } from '@/types/gazette'
import { Check, Copy, ExternalLink, RefreshCw } from 'lucide-react'
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { toast } from 'sonner'

interface FuncProps {
  onOpen: (gazette: IGazette) => void
  onClose: () => void
}

interface IShareDialogProps {
  apiUrl: string
  nodeEnv: NodeENVType
}

const ShareDialog: React.ForwardRefRenderFunction<FuncProps, IShareDialogProps> = (
  { apiUrl, nodeEnv },
  ref,
) => {
  const { token } = useApp()
  const handleApiError = useHandleApiError()
  const [open, setOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [shareUrl, setShareUrl] = useState<string>('')
  const [gazette, setGazette] = useState<IGazette | null>(null)

  useImperativeHandle(ref, () => ({
    onOpen(gazette) {
      setGazette(gazette)
      setOpen(true)
      setShareUrl('')
    },

    onClose() {
      setOpen(false)
      setShareUrl('')
    },
  }))

  const handleGenerateShareLink = async () => {
    if (!gazette || !token) return

    setIsLoading(true)
    try {
      const url = `${apiUrl}/gazettes/${gazette?.id}/share`
      const response = await fetchApi(url, token!, nodeEnv, {
        method: 'POST',
      })

      if (response.share_key) {
        const baseUrl = window.location.origin
        const fullShareUrl = `${baseUrl}/gazettes/share/${response.share_key}`
        setShareUrl(fullShareUrl)
      }
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerateShareKey = async () => {
    if (!gazette || !token) return

    setIsLoading(true)
    try {
      const url = `${apiUrl}/gazettes/${gazette.id}/regenerate-share-key`
      const response = await fetchApi(url, token, nodeEnv, {
        method: 'POST',
      })

      if (response.share_key) {
        const baseUrl = window.location.origin
        const fullShareUrl = `${baseUrl}/gazettes/share/${response.share_key}`
        setShareUrl(fullShareUrl)
        toast.success('Share key regenerated successfully!')
      }
    } catch (error: any) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyToClipboard = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Share link copied to clipboard!')
      } catch (error) {
        toast.error('Failed to copy to clipboard')
      }
    }
  }

  const handleOpenShareLink = () => {
    if (shareUrl) {
      window.open(shareUrl, '_blank')
    }
  }

  useEffect(() => {
    if (gazette && token) {
      handleGenerateShareLink()
    }
  }, [gazette, token])

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen(false)
        setShareUrl('')
      }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">Share Gazette</DialogTitle>
          <DialogDescription>
            Generate a shareable link for &quot;{gazette?.header}&quot; that can be
            accessed without an account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-6 text-center">
              <RefreshCw className="h-8 w-8 animate-spin" />
              <p className="mb-4 text-sm text-muted-foreground">
                Generating shareable link for this gazette...
              </p>
            </div>
          ) : !shareUrl ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 h-16 w-16 overflow-hidden rounded-full bg-red-100 p-4">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Failed to generate share link. Please try again.
              </p>
              <Button onClick={handleGenerateShareLink} className="w-full">
                Retry
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Success indicator */}
              <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-800/20">
                <Check className="text-green-600" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Share link generated successfully!
                </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="share-url">Share Link</Label>
                <div className="flex gap-2">
                  <Input id="share-url" value={shareUrl} readOnly className="flex-1" />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopyToClipboard}
                    title="Copy to clipboard">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {shareUrl && (
          <DialogFooter className="mt-5 flex justify-between">
            <Button
              variant="outline"
              onClick={handleRegenerateShareKey}
              disabled={isLoading}>
              {isLoading ? 'Regenerating...' : 'Regenerate Key'}
            </Button>

            <Button onClick={handleOpenShareLink} className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Open Share Link
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default forwardRef(ShareDialog)
