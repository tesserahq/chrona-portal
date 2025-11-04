import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/misc'

interface StatusBadgeProps {
  status: string
  className?: string
}

type StatusConfig = {
  variant: 'default' | 'secondary'
  className: string
  label: string
}

const getStatusConfig = (status: string): StatusConfig => {
  const statusMap: Record<string, StatusConfig> = {
    processing: {
      variant: 'default',
      className:
        'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
      label: 'Processing',
    },
    completed: {
      variant: 'default',
      className:
        'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
      label: 'Completed',
    },
    success: {
      variant: 'default',
      className:
        'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
      label: 'Success',
    },
    completed_with_errors: {
      variant: 'default',
      className:
        'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
      label: 'Completed with Errors',
    },
    failed: {
      variant: 'default',
      className:
        'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
      label: 'Failed',
    },
    draft: {
      variant: 'default',
      className:
        'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
      label: 'Draft',
    },
    published: {
      variant: 'default',
      className:
        'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
      label: 'Published',
    },
  }

  return (
    statusMap[status.toLowerCase()] || {
      variant: 'secondary',
      className:
        'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800',
      label: status,
    }
  )
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = getStatusConfig(status)

  return (
    <Badge
      variant={config.variant}
      className={cn('border font-medium shadow-none', config.className, className)}>
      <span className="capitalize">{config.label}</span>
    </Badge>
  )
}
