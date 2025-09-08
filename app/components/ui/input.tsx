import * as React from 'react'

import { cn } from '@/utils/misc'
import { Button } from './button'
import { Eye, EyeOff } from 'lucide-react'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    const [fieldType, setFieldType] = React.useState<string>(type || 'text')
    return (
      <div className="relative w-full">
        <input
          type={fieldType}
          className={cn(
            'flex h-10 w-full rounded border border-input bg-transparent px-3 py-2 text-base ring-offset-background transition-all duration-100 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground placeholder:opacity-50 hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:text-primary-foreground md:text-sm',
            className,
          )}
          ref={ref}
          {...props}
        />
        {type === 'password' && (
          <Button
            size="icon"
            variant="ghost"
            type="button"
            onClick={() => setFieldType(fieldType === 'text' ? 'password' : 'text')}
            className="absolute right-0 top-0 rounded hover:bg-transparent">
            {fieldType === 'text' ? <Eye /> : <EyeOff />}
          </Button>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'

export { Input }
