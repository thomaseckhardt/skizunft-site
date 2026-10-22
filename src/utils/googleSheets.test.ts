import { describe, expect, it, vi } from 'vitest'
import { saveSheet, withBackoff } from './googleSheets'

vi.spyOn(console, 'log').mockImplementation(() => {})

const noDelay = { delayMs: 0, backoff: { baseDelayMs: 0, jitter: false } }

const tooManyRequests = () =>
  Object.assign(new Error('Too many requests'), { response: { status: 429 } })

/** In-memory stand-in for a spreadsheet that records every write. */
const fakeSpreadsheet = (titles: string[] = []) => {
  const calls: unknown[][] = []
  const fakeSheet = (title: string) => ({
    clear: vi.fn(async () => {
      calls.push(['clear', title])
    }),
    setHeaderRow: vi.fn(async (header: string[]) => {
      calls.push(['setHeaderRow', title, header])
    }),
    addRows: vi.fn(async (rows: unknown[][]) => {
      calls.push(['addRows', title, rows])
      return []
    }),
  })
  const sheetsByTitle: Record<string, ReturnType<typeof fakeSheet>> =
    Object.fromEntries(titles.map((title) => [title, fakeSheet(title)]))
  const doc = {
    sheetsByTitle,
    addSheet: vi.fn(async ({ title }: { title: string }) => {
      calls.push(['addSheet', title])
      sheetsByTitle[title] = fakeSheet(title)
      return sheetsByTitle[title]
    }),
  }
  return { doc, calls }
}

describe('saveSheet', () => {
  it('replaces the content of an existing tab', async () => {
    const { doc, calls } = fakeSpreadsheet(['bookings'])

    await saveSheet(
      doc as any,
      { tabName: 'bookings', data: [['Kurs', 'Teilnehmerzahl'], ['a', 1]] },
      noDelay,
    )

    expect(calls).toEqual([
      ['clear', 'bookings'],
      ['setHeaderRow', 'bookings', ['Kurs', 'Teilnehmerzahl']],
      ['addRows', 'bookings', [['a', 1]]],
    ])
  })

  it('creates a missing tab', async () => {
    const { doc, calls } = fakeSpreadsheet()

    await saveSheet(
      doc as any,
      { tabName: 'ski-bambini-1', data: [['Buchungsnummer']] },
      noDelay,
    )

    expect(calls).toEqual([
      ['addSheet', 'ski-bambini-1'],
      ['clear', 'ski-bambini-1'],
      ['setHeaderRow', 'ski-bambini-1', ['Buchungsnummer']],
    ])
  })

  it('only clears the tab when there is no data', async () => {
    const { doc, calls } = fakeSpreadsheet(['overview'])

    await saveSheet(doc as any, { tabName: 'overview', data: [] }, noDelay)

    expect(calls).toEqual([['clear', 'overview']])
  })

  it('adds rows in chunks, keeping their order', async () => {
    const { doc, calls } = fakeSpreadsheet(['attendees'])
    const rows = Array.from({ length: 5 }, (_, i) => [`row ${i + 1}`])

    await saveSheet(
      doc as any,
      { tabName: 'attendees', data: [['Header'], ...rows] },
      { ...noDelay, chunkSize: 2 },
    )

    expect(calls.filter(([call]) => call === 'addRows')).toEqual([
      ['addRows', 'attendees', [['row 1'], ['row 2']]],
      ['addRows', 'attendees', [['row 3'], ['row 4']]],
      ['addRows', 'attendees', [['row 5']]],
    ])
  })

  it('retries a write that hit the rate limit', async () => {
    const { doc } = fakeSpreadsheet(['bookings'])
    const sheet = doc.sheetsByTitle.bookings
    sheet.addRows.mockRejectedValueOnce(tooManyRequests())

    await saveSheet(
      doc as any,
      { tabName: 'bookings', data: [['Header'], ['row']] },
      noDelay,
    )

    expect(sheet.addRows).toHaveBeenCalledTimes(2)
  })
})

describe('withBackoff', () => {
  const options = { retries: 2, baseDelayMs: 0, jitter: false }

  it('returns the result once a retry succeeds', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(tooManyRequests())
      .mockResolvedValueOnce('done')

    await expect(withBackoff(fn, options)).resolves.toBe('done')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('gives up after the last retry', async () => {
    const fn = vi.fn().mockRejectedValue(tooManyRequests())

    await expect(withBackoff(fn, options)).rejects.toThrow('Too many requests')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('does not retry other errors', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('invalid_grant'))

    await expect(withBackoff(fn, options)).rejects.toThrow('invalid_grant')
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
