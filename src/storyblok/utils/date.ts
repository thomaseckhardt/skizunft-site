export function parseDate(date) {
  if (!date) return
  return new Date(storyblokDate(date))
}

export function storyblokDate(date) {
  if (!date) return
  return `${date}+0000`
}

export function getQueryDate(date) {
  if (!date) return
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const formattedDate = `${year}-${month}-${day}`
  return formattedDate
}
