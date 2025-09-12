/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  avatarColors,
  avatarName,
  avatarVariants,
  IWorkspaceLogo,
} from '@/types/workspace'
import { cn } from '@/utils/misc'
import { Check } from 'lucide-react'
import { forwardRef, useImperativeHandle, useState } from 'react'
import Avatar from 'boring-avatars'

interface FuncProps {
  onOpen: (logo: IWorkspaceLogo) => void
}

interface IProps {
  onLogoChange: (logo: IWorkspaceLogo) => void
}

const LogoSelectorDialog: React.ForwardRefRenderFunction<FuncProps, IProps> = (
  { onLogoChange }: IProps,
  ref,
) => {
  const [open, setOpen] = useState<boolean>(false)
  const [logo, setLogo] = useState<IWorkspaceLogo>({
    name: avatarName,
    variant: 'beam',
    colors: avatarColors[0],
  })

  useImperativeHandle(ref, () => ({
    onOpen(initialLogo: IWorkspaceLogo) {
      setLogo(initialLogo)
      setOpen(true)
    },
  }))

  const handleSave = () => {
    onLogoChange(logo)
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle>Customize Logo</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Color Selection */}
          <div>
            <Label className="text-sm font-medium">Color Scheme</Label>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {avatarColors.map((colors, index) => (
                <div
                  key={index}
                  className={cn(
                    'relative flex cursor-pointer items-center gap-0 overflow-hidden rounded border border-input p-0.5 transition-all hover:scale-105',
                    JSON.stringify(logo.colors) === JSON.stringify(colors) &&
                      'border-primary ring-2 ring-primary/20',
                  )}
                  onClick={() => setLogo({ ...logo, colors })}>
                  {colors.map((bgColor, idx) => (
                    <div
                      key={idx}
                      style={{ background: bgColor }}
                      className="h-12 w-6"></div>
                  ))}
                  {JSON.stringify(logo.colors) === JSON.stringify(colors) && (
                    <div className="absolute right-1 top-1 rounded-full bg-primary p-1 text-background">
                      <Check size={12} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Type Selection */}
          <div>
            <Label className="text-sm font-medium">Avatar Style</Label>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              {avatarVariants.map((type, index) => (
                <div
                  key={index}
                  className="relative flex cursor-pointer flex-col items-center gap-2 rounded-lg p-3 transition-all hover:bg-muted"
                  onClick={() => setLogo({ ...logo, variant: type })}>
                  <Avatar
                    name={logo.name}
                    size={50}
                    variant={type as any}
                    colors={logo.colors}
                  />
                  <span
                    className={cn(
                      'text-xs capitalize text-muted-foreground transition-colors',
                      logo.variant === type && 'font-medium text-primary',
                    )}>
                    {type}
                  </span>
                  {logo.variant === type && (
                    <div className="absolute -right-1 -top-1 rounded-full bg-primary p-1 text-background">
                      <Check size={10} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex flex-col items-center justify-center space-y-3 rounded-lg border border-input bg-muted/30 p-6">
            <Avatar
              name={logo.name}
              variant={logo.variant as any}
              size={120}
              colors={logo.colors}
            />
            <div className="text-sm text-muted-foreground">Preview</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Logo</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default forwardRef(LogoSelectorDialog)
