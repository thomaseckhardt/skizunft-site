import { describe, expect, it } from 'vitest'
import { parseSubmission } from './parseSubmission'

const body = (overrides: Record<string, unknown> = {}) => ({
  firstName: ' Anna ',
  lastName: 'Muster',
  address: 'Hauptstr. 1',
  zip: '79312',
  city: 'Emmendingen',
  country: '',
  email: 'anna@example.com',
  phone: '0170 1234567',
  legalConfirmed: true,
  privacyConfirmed: true,
  photoConsent: false,
  website: '',
  attendees: [
    {
      firstName: 'Ben',
      lastName: 'Muster',
      age: 7,
      member: true,
      courses: ['ski-beginner-1'],
    },
  ],
  ...overrides,
})

describe('parseSubmission', () => {
  it('accepts a booking and trims the text fields', () => {
    const result = parseSubmission(body({ discountCode: 'brettlemarkt2026' }))
    expect(result).toMatchObject({
      ok: true,
      submission: {
        firstName: 'Anna',
        country: '',
        discountCode: 'brettlemarkt2026',
        attendees: [{ firstName: 'Ben', age: 7, member: true }],
      },
    })
  })

  it('drops fields it does not know, such as a price', () => {
    const result = parseSubmission(body({ priceTotal: 1 }))
    expect(result.ok && 'priceTotal' in result.submission).toBe(false)
  })

  it.each([
    ['a filled honeypot', { website: 'https://spam.example' }],
    ['a missing name', { lastName: '  ' }],
    ['a too long name', { firstName: 'A'.repeat(101) }],
    ['an invalid email', { email: 'anna' }],
    ['terms not confirmed', { legalConfirmed: false }],
    ['privacy not confirmed', { privacyConfirmed: 'yes' }],
    ['no attendees', { attendees: [] }],
    ['too many attendees', { attendees: Array(11).fill(body().attendees[0]) }],
  ])('rejects %s', (_, overrides) => {
    expect(parseSubmission(body(overrides)).ok).toBe(false)
  })

  it.each([
    ['an attendee without courses', { courses: [] }],
    ['a course booked twice', { courses: ['a', 'a'] }],
    ['an age that is not a whole number', { age: 7.5 }],
    ['a member flag that is not a boolean', { member: 'true' }],
  ])('rejects %s', (_, overrides) => {
    const attendee = { ...body().attendees[0], ...overrides }
    expect(parseSubmission(body({ attendees: [attendee] })).ok).toBe(false)
  })

  it('rejects a body that is not an object', () => {
    expect(parseSubmission(null).ok).toBe(false)
    expect(parseSubmission([]).ok).toBe(false)
  })
})
