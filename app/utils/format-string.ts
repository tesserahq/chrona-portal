export const formatString = (format: 'kebab-case' | 'snake_case', value: string) => {
  switch (format) {
    case 'kebab-case': // this-is-text
      return value.trim().toLowerCase().replace(/\s+/g, '-')

    case 'snake_case':
      return value.trim().toLowerCase().replace(/\s+/g, '_')

    default:
      return value
  }
}
