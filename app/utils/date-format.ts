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

/**
 * Formats a Date object to ISO string preserving the local date/time components as UTC.
 * This is useful when you want to send a date/time to the backend without timezone conversion.
 *
 * Example: If user selects Nov 25, 2025 02:30 AM in GMT+0700, this will return
 * "2025-11-25T02:30:00.000Z" instead of "2025-11-24T19:30:00.000Z"
 *
 * @param date - The Date object to format
 * @returns ISO string with preserved date/time components
 */
export const formatDatetimeToUTC = (date: Date | null): string => {
  if (!date) {
    return ''
  }

  // Extract local date/time components
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0')

  // Format as UTC ISO string preserving the date/time components
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`
}
