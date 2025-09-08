export const bytesForHuman = (bytes: number, decimals = 2) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

  let i = 0

  for (i; bytes > 1024; i++) {
    bytes /= 1024
  }

  return parseFloat(bytes.toFixed(decimals)) + ' ' + units[i]
}
