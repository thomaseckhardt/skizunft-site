export const parseIntUndefined = (
  value: number | string | undefined,
  radix?: number,
): number | undefined => {
  if (!value) return undefined
  if (typeof value === 'number') {
    value = value.toString()
  }
  const parsed = parseInt(value, radix)
  if (isNaN(parsed)) return undefined
  return parsed
}
