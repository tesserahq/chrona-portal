export const formatDateRangeToUTC = (dateStr: string, isEndOfDay: boolean) => {
  // Parse the date string - handles both ISO strings and Date.toString() format
  const date = new Date(dateStr)

  // Extract the calendar date from the Date object
  // Use getFullYear/getMonth/getDate to get the local calendar date
  // which represents what the user selected, then format as UTC
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  if (isEndOfDay) {
    return `${year}-${month}-${day}T23:59:59Z`
  }
  return `${year}-${month}-${day}T00:00:00Z`
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
