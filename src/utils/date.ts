export function isValidDate(date: any): boolean {
  if (!(date instanceof Date)) {
    return false
  }
  return !Number.isNaN(date.getTime())
}
