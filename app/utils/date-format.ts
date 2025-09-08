import {
  differenceInDays,
  differenceInHours,
  differenceInMonths,
  differenceInWeeks,
  format,
  isSameDay,
} from 'date-fns'

export const formatDateAgo = (date: string) => {
  const now = new Date()
  const currentDate = new Date(date)

  if (isSameDay(now, currentDate)) {
    return 'Today'
  }

  if (
    differenceInHours(now, currentDate) > 0 &&
    differenceInHours(now, currentDate) < 24
  ) {
    const days = differenceInHours(now, currentDate)
    return `${days} hour${days > 1 ? 's' : ''} ago`
  }

  if (differenceInDays(now, currentDate) >= 0 && differenceInDays(now, currentDate) < 7) {
    const days = differenceInDays(now, currentDate)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  if (
    differenceInWeeks(now, currentDate) >= 0 &&
    differenceInWeeks(now, currentDate) < 4
  ) {
    const weeks = differenceInWeeks(now, currentDate)
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  }

  if (
    differenceInMonths(now, currentDate) >= 0 &&
    differenceInMonths(now, currentDate) < 12
  ) {
    const months = differenceInMonths(now, currentDate)
    return `${months} month${months > 1 ? 's' : ''} ago`
  }

  return format(currentDate, 'MMM dd, yyyy')
}
