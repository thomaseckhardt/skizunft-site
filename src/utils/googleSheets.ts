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

type Sheet = { rowCount: number; columnCount: number; sheetId: number }

type Spreadsheet = {
  sheetsByTitle: Record<string, Sheet>
  sheetsApi: {
    post: (url: string, options: { json: unknown }) => PromiseLike<unknown>
  }
}

/** Size of a tab Google Sheets creates without explicit grid properties. */
const DEFAULT_GRID = { rowCount: 1000, columnCount: 26 }

/** A1 range covering a whole tab, e.g. `'ski-bambini-1'`. */
const tabRange = (tabName: string) => `'${tabName.replace(/'/g, "''")}'`

/**
 * Replaces the content of the given sheet tabs. The first row of each tab's
 * data is its header row. Missing tabs are created and tabs too small for
 * their data are enlarged.
 *
 * All tabs are written together in at most three requests, so a sync stays
 * far below the write quota of the Sheets API and finishes in a few seconds.
 */
export const saveSheets = async (
  doc: Spreadsheet,
  sheets: { tabName: string; data: SheetRow[] }[],
  { backoff = {} as BackoffOptions } = {},
) => {
  const gridRequests = sheets.flatMap(({ tabName, data }) => {
    const rowCount = data.length
    const columnCount = Math.max(0, ...data.map((row) => row.length))
    const sheet = doc.sheetsByTitle[tabName]
    if (!sheet) {
      return {
        addSheet: {
          properties: {
            title: tabName,
            gridProperties: {
              rowCount: Math.max(rowCount, DEFAULT_GRID.rowCount),
              columnCount: Math.max(columnCount, DEFAULT_GRID.columnCount),
            },
          },
        },
      }
    }
    if (rowCount <= sheet.rowCount && columnCount <= sheet.columnCount) {
      return []
    }
    return {
      updateSheetProperties: {
        properties: {
          sheetId: sheet.sheetId,
          gridProperties: {
            rowCount: Math.max(rowCount, sheet.rowCount),
            columnCount: Math.max(columnCount, sheet.columnCount),
          },
        },
        fields: 'gridProperties(rowCount,columnCount)',
      },
    }
  })
  if (gridRequests.length > 0) {
    await withBackoff(
      () =>
        doc.sheetsApi.post(':batchUpdate', {
          json: { requests: gridRequests },
        }),
      backoff,
    )
  }

  await withBackoff(
    () =>
      doc.sheetsApi.post('values:batchClear', {
        json: { ranges: sheets.map(({ tabName }) => tabRange(tabName)) },
      }),
    backoff,
  )

  const data = sheets
    .filter(({ data }) => data.length > 0)
    .map(({ tabName, data }) => ({
      range: `${tabRange(tabName)}!A1`,
      majorDimension: 'ROWS',
      values: data,
    }))
  if (data.length > 0) {
    await withBackoff(
      () =>
        doc.sheetsApi.post('values:batchUpdate', {
          // Same as typing the values in, so formulas like =SUMME() work
          json: { valueInputOption: 'USER_ENTERED', data },
        }),
      backoff,
    )
  }

  console.log(
    `Successfully updated sheets: ${sheets.map((s) => s.tabName).join(', ')}`,
  )
}
