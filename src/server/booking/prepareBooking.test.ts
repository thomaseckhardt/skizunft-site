import { describe, expect, it, vi } from 'vitest'
import type { Submission } from './parseSubmission'
import { prepareBooking, type Catalog } from './prepareBooking'

vi.mock('../../components/booking/discountCodes', () => ({
  discountCodes: { brettlemarkt2026: { rate: 0.1, label: 'Brettlemarkt' } },
}))

const catalog: Catalog = {
  courseCategories: [{ id: 'beginner', price: 100, priceMember: 80 }],
  courses: [
    { slug: 'open', categoryId: 'beginner', seatLimit: '8' },
    { slug: 'unlimited', categoryId: 'beginner' },
    { slug: 'closed', categoryId: 'beginner', closed: true },
    { slug: 'canceled', categoryId: 'beginner', canceled: true },
    { slug: 'no-category', categoryId: 'missing' },
  ],
}

const submission = (
  attendees: { member?: boolean; courses: string[] }[],
  overrides: Partial<Submission> = {},
): Submission => ({
  firstName: 'Anna',
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
  attendees: attendees.map(({ member = false, courses }) => ({
    firstName: 'Ben',
    lastName: 'Muster',
    age: 7,
    member,
    courses,
  })),
  ...overrides,
})

describe('prepareBooking', () => {
  it('calculates the prices from the catalog', () => {
    const result = prepareBooking(
      submission([
        { courses: ['open', 'unlimited'] },
        { member: true, courses: ['open'] },
      ]),
      catalog,
    )
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.prepared.attendees.map((a) => a.priceTotal)).toEqual([
      200, 80,
    ])
    expect(result.prepared.booking.priceTotal).toBe(280)
  })

  it('applies a valid Discount Code and stores it', () => {
    const result = prepareBooking(
      submission([{ courses: ['open'] }], { discountCode: 'brettlemarkt2026' }),
      catalog,
    )
    expect(result.ok && result.prepared.booking).toMatchObject({
      priceTotal: 90,
      discountCode: 'brettlemarkt2026',
    })
  })

  it('ignores an unknown Discount Code', () => {
    const result = prepareBooking(
      submission([{ courses: ['open'] }], { discountCode: 'free' }),
      catalog,
    )
    expect(result.ok && result.prepared.booking.priceTotal).toBe(100)
    expect(result.ok && 'discountCode' in result.prepared.booking).toBe(false)
  })

  it('passes the seat limits of the booked courses on', () => {
    const result = prepareBooking(
      submission([{ courses: ['open', 'unlimited'] }]),
      catalog,
    )
    expect(result.ok && result.prepared.seatLimits).toEqual({ open: 8 })
  })

  it('rejects courses that are not in the catalog or have no category', () => {
    expect(
      prepareBooking(
        submission([{ courses: ['nope', 'no-category'] }]),
        catalog,
      ),
    ).toEqual({
      ok: false,
      error: 'unknownCourse',
      courses: ['nope', 'no-category'],
    })
  })

  it('rejects closed and canceled courses', () => {
    expect(
      prepareBooking(
        submission([{ courses: ['closed', 'canceled'] }]),
        catalog,
      ),
    ).toEqual({
      ok: false,
      error: 'unbookable',
      courses: ['closed', 'canceled'],
    })
  })

  it('does not store the booking key', () => {
    const result = prepareBooking(
      submission([{ courses: ['open'] }], { bookingKey: 'internal' }),
      catalog,
    )
    expect(result.ok && 'bookingKey' in result.prepared.booking).toBe(false)
  })
})
