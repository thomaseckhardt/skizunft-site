import { describe, expect, it } from 'vitest'
import {
  buildEpcPayload,
  formatDueDate,
  formatIban,
  getPaymentDueDate,
  getPaymentReference,
} from './payment'

// Course dates come from Storyblok as UTC timestamps
const courseStart = new Date('2027-01-02T09:00:00Z')

describe('getPaymentDueDate', () => {
  it('is five days before the first course, across the year boundary', () => {
    const now = new Date('2026-11-15T10:00:00Z')
    expect(getPaymentDueDate(courseStart, now)).toBe('2026-12-28')
  })

  it('is still the due day on that day itself', () => {
    const now = new Date('2026-12-28T22:30:00Z') // 23:30 in Berlin
    expect(getPaymentDueDate(courseStart, now)).toBe('2026-12-28')
  })

  it('is due immediately once the due day has passed in Berlin', () => {
    const now = new Date('2026-12-28T23:30:00Z') // 00:30 on Dec 29 in Berlin
    expect(getPaymentDueDate(courseStart, now)).toBeNull()
  })

  it('uses the Berlin calendar day of the course start', () => {
    const lateUtcStart = new Date('2027-01-01T23:30:00Z') // Jan 2 in Berlin
    const now = new Date('2026-11-15T10:00:00Z')
    expect(getPaymentDueDate(lateUtcStart, now)).toBe('2026-12-28')
  })
})

describe('formatDueDate', () => {
  it('formats with weekday', () => {
    expect(formatDueDate('2026-12-28')).toBe('Montag, 28.12.2026')
  })
})

describe('formatIban', () => {
  it('groups in blocks of four', () => {
    expect(formatIban('DE61680501010012099212')).toBe(
      'DE61 6805 0101 0012 0992 12',
    )
  })
})

describe('getPaymentReference', () => {
  it('joins order number and payer name', () => {
    expect(
      getPaymentReference({
        orderNumber: '178312',
        firstName: ' Julia ',
        lastName: 'Müller',
      }),
    ).toBe('178312 Julia Müller')
  })

  it('cuts to 140 characters', () => {
    const reference = getPaymentReference({
      orderNumber: '178312',
      firstName: 'A'.repeat(100),
      lastName: 'B'.repeat(100),
    })
    expect(reference).toHaveLength(140)
  })
})

describe('buildEpcPayload', () => {
  it('builds a version 002 SEPA credit transfer', () => {
    expect(
      buildEpcPayload({ amount: 212.4, reference: '178312 Julia Müller' }),
    ).toBe(
      [
        'BCD',
        '002',
        '1',
        'SCT',
        'FRSPDE66XXX',
        'Ski-Zunft Kollnau e.V.',
        'DE61680501010012099212',
        'EUR212.40',
        '',
        '',
        '178312 Julia Müller',
      ].join('\n'),
    )
  })

  it.each([0, -5, 1_000_000_000, Number.NaN])(
    'rejects the amount %s',
    (amount) => {
      expect(() => buildEpcPayload({ amount, reference: 'x' })).toThrow(
        RangeError,
      )
    },
  )

  it('rejects references that are too long or span lines', () => {
    expect(() =>
      buildEpcPayload({ amount: 10, reference: 'x'.repeat(141) }),
    ).toThrow(RangeError)
    expect(() => buildEpcPayload({ amount: 10, reference: 'a\nb' })).toThrow(
      RangeError,
    )
  })

  it('rejects payloads over 331 bytes', () => {
    expect(() =>
      buildEpcPayload({ amount: 10, reference: 'ü'.repeat(140) }),
    ).toThrow(RangeError)
  })
})
