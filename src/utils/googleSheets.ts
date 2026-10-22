import type { GoogleSpreadsheet } from 'google-spreadsheet'

export type SheetRow = (string | number | boolean | undefined)[]

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

type BackoffOptions = {
  retries?: number
  baseDelayMs?: number
  maxDelayMs?: number
  factor?: number
  jitter?: boolean
}

/** Retries `fn` with exponential backoff while Sheets answers with HTTP 429. */
export const withBackoff = async <T>(
  fn: () => Promise<T>,
  {
    retries = 6,
    baseDelayMs = 1000,
    maxDelayMs = 60000,
    factor = 2,
    jitter = true,
  }: BackoffOptions = {},
): Promise<T> => {
  let delay = baseDelayMs
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      const status = error?.response?.status ?? error?.status
      if (status !== 429) throw error
      if (attempt === retries) throw error
      const jitterMs = jitter ? Math.random() * (delay * 0.5) : 0
      const wait = Math.min(delay + jitterMs, maxDelayMs)
      console.log(
        `Sheets 429 - backing off ${Math.round(wait)}ms (attempt ${
          attempt + 1
        }/${retries})`,
      )
      await sleep(wait)
      delay = Math.min(delay * factor, maxDelayMs)
    }
  }
  // Unreachable, but TS appeasement
  throw new Error('withBackoff: exhausted without throwing')
}

type Sheet = Pick<
  GoogleSpreadsheet['sheetsByIndex'][number],
  'clear' | 'setHeaderRow' | 'addRows'
>

type Spreadsheet = {
  sheetsByTitle: Record<string, Sheet>
  addSheet: (properties: { title: string }) => Promise<Sheet>
}

/**
 * Replaces the content of a sheet tab, creating the tab if it is missing.
 * The first row becomes the header row, the rest is added in chunks to
 * reduce API bursts and 429s.
 */
export const saveSheet = async (
  doc: Spreadsheet,
  { tabName, data }: { tabName: string; data: SheetRow[] },
  { chunkSize = 200, delayMs = 100, backoff = {} as BackoffOptions } = {},
) => {
  let sheet = doc.sheetsByTitle[tabName]
  if (!sheet) {
    sheet = await withBackoff(() => doc.addSheet({ title: tabName }), backoff)
  }

  await withBackoff(() => sheet.clear(), backoff)

  if (data.length > 0) {
    await withBackoff(() => sheet.setHeaderRow(data[0] as string[]), backoff)
    const rows = data.slice(1)
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize)
      await withBackoff(() => sheet.addRows(chunk as any), backoff)
      if (i + chunkSize < rows.length) await sleep(delayMs)
    }
  }

  console.log(`Successfully updated sheet: ${tabName}`)
}
