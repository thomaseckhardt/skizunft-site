import { describe, expect, it, vi } from 'vitest'
import { saveSheets, withBackoff } from './googleSheets'

vi.spyOn(console, 'log').mockImplementation(() => {})

const noDelay = { backoff: { baseDelayMs: 0, jitter: false } }

const tooManyRequests = () =>
  Object.assign(new Error('Too many requests'), { response: { status: 429 } })

/** In-memory stand-in for a spreadsheet that records every request. */
const fakeSpreadsheet = (
  sheetsByTitle: Record<
    string,
    { sheetId: number; rowCount: number; columnCount: number }
  > = {},
) => {
  const post = vi.fn(async (_url: string, _options: { json: unknown }) => ({}))
  const doc = { sheetsByTitle, sheetsApi: { post } }
  const calls = () => post.mock.calls.map(([url, { json }]) => [url, json])
  return { doc, post, calls }
}

const defaultTab = (sheetId: number) => ({
  sheetId,
  rowCount: 1000,
  columnCount: 26,
})

describe('saveSheets', () => {
  it('replaces the content of all tabs in one clear and one write', async () => {
    const { doc, calls } = fakeSpreadsheet({
      bookings: defaultTab(1),
      overview: defaultTab(2),
    })

    await saveSheets(
      doc,
      [
        { tabName: 'bookings', data: [['Buchungsnummer'], ['123']] },
        {
          tabName: 'overview',
          data: [
            ['Kurs', 'Teilnehmerzahl'],
            ['a', 1],
          ],
        },
      ],
      noDelay,
    )

    expect(calls()).toEqual([
      ['values:batchClear', { ranges: ["'bookings'", "'overview'"] }],
      [
        'values:batchUpdate',
        {
          valueInputOption: 'USER_ENTERED',
          data: [
            {
              range: "'bookings'!A1",
              majorDimension: 'ROWS',
              values: [['Buchungsnummer'], ['123']],
            },
            {
              range: "'overview'!A1",
              majorDimension: 'ROWS',
              values: [
                ['Kurs', 'Teilnehmerzahl'],
                ['a', 1],
              ],
            },
          ],
        },
      ],
    ])
  })

  it('creates missing tabs before writing', async () => {
    const { doc, calls } = fakeSpreadsheet()

    await saveSheets(
      doc,
      [{ tabName: 'ski-bambini-1', data: [['Buchungsnummer']] }],
      noDelay,
    )

    expect(calls()[0]).toEqual([
      ':batchUpdate',
      {
        requests: [
          {
            addSheet: {
              properties: {
                title: 'ski-bambini-1',
                gridProperties: { rowCount: 1000, columnCount: 26 },
              },
            },
          },
        ],
      },
    ])
  })

  it('enlarges tabs too small for their data', async () => {
    const { doc, calls } = fakeSpreadsheet({
      attendees: { sheetId: 7, rowCount: 2, columnCount: 26 },
    })

    await saveSheets(
      doc,
      [{ tabName: 'attendees', data: [['Header'], ['a'], ['b']] }],
      noDelay,
    )

    expect(calls()[0]).toEqual([
      ':batchUpdate',
      {
        requests: [
          {
            updateSheetProperties: {
              properties: {
                sheetId: 7,
                gridProperties: { rowCount: 3, columnCount: 26 },
              },
              fields: 'gridProperties(rowCount,columnCount)',
            },
          },
        ],
      },
    ])
  })

  it('only clears tabs without data', async () => {
    const { doc, calls } = fakeSpreadsheet({ overview: defaultTab(1) })

    await saveSheets(doc, [{ tabName: 'overview', data: [] }], noDelay)

    expect(calls()).toEqual([['values:batchClear', { ranges: ["'overview'"] }]])
  })

  it('escapes apostrophes in tab names', async () => {
    const { doc, calls } = fakeSpreadsheet({ "kid's": defaultTab(1) })

    await saveSheets(doc, [{ tabName: "kid's", data: [['a']] }], noDelay)

    expect(calls()[0]).toEqual(['values:batchClear', { ranges: ["'kid''s'"] }])
  })

  it('retries a request that hit the rate limit', async () => {
    const { doc, post } = fakeSpreadsheet({ bookings: defaultTab(1) })
    post.mockRejectedValueOnce(tooManyRequests())

    await saveSheets(
      doc,
      [{ tabName: 'bookings', data: [['Header'], ['row']] }],
      noDelay,
    )

    expect(post.mock.calls.map(([url]) => url)).toEqual([
      'values:batchClear',
      'values:batchClear',
      'values:batchUpdate',
    ])
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
