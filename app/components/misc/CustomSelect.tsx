/* eslint-disable @typescript-eslint/no-explicit-any */
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'

interface Props {
  name: string
  checked: boolean
  value: string
  onCheckedChange: (checked: boolean) => void
  description?: string
}

export default function CustomSelect({
  name,
  value,
  description,
  onCheckedChange,
  checked,
}: Props) {
  return (
    <Label className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50 has-[[aria-checked=true]]:border-primary has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-primary dark:has-[[aria-checked=true]]:bg-card">
      <Checkbox
        id="tools"
        checked={checked}
        value={value}
        onCheckedChange={onCheckedChange}
        className="data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white dark:data-[state=checked]:border-primary dark:data-[state=checked]:bg-primary"
      />
      <div className="grid gap-1.5 font-normal">
        <p className="text-sm font-medium leading-none">{name}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </Label>
  )
}
