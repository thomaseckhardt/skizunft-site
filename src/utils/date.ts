export function isValidDate(date: any): boolean {
  if (!(date instanceof Date)) {
    return false
  }
  return !Number.isNaN(date.getTime())
}

export const dateFormat = new Intl.DateTimeFormat('de-DE', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})
export const dateShortFormat = new Intl.DateTimeFormat('de-DE', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
})