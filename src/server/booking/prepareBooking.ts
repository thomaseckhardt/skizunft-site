import { parseSeatLimit } from '../../components/booking/flow/availability'
import { createPricing, getDiscountRate } from '../../components/booking/pricing'
import type { Submission } from './parseSubmission'

type CatalogCourse = {
  slug: string
  categoryId?: string
  closed?: boolean
  canceled?: boolean
  seatLimit?: unknown
}

type CatalogCategory = { id: string; price: number; priceMember: number }

export type Catalog = {
  courses: CatalogCourse[]
  courseCategories: CatalogCategory[]
}

export type PreparedBooking = {
  booking: {
    firstName: string
    lastName: string
    address: string
    zip: string
    city: string
    country: string
    email: string
    phone: string
    priceTotal: number
    legalConfirmed: boolean
    privacyConfirmed: boolean
    photoConsent: boolean
    discountCode?: string
  }
  attendees: {
    firstName: string
    lastName: string
    age: number
    member: boolean
    courses: string[]
    priceTotal: number
  }[]
  /** Seat limits of the booked courses that have one */
  seatLimits: Record<string, number>
}

export type PrepareResult =
  | { ok: true; prepared: PreparedBooking }
  | { ok: false; error: 'unknownCourse' | 'unbookable'; courses: string[] }

/**
 * Checks the booked courses against the catalog and calculates the prices
 * on the server, so the client can't choose them. Free Seats are checked
 * later, inside the Convex transaction that stores the booking.
 */
export function prepareBooking(
  submission: Submission,
  catalog: Catalog,
): PrepareResult {
  const coursesBySlug = new Map(catalog.courses.map((c) => [c.slug, c]))
  const categoryIds = new Set(catalog.courseCategories.map((c) => c.id))
  const bookedSlugs = [
    ...new Set(submission.attendees.flatMap((attendee) => attendee.courses)),
  ]

  const unknown = bookedSlugs.filter((slug) => {
    const course = coursesBySlug.get(slug)
    return !course?.categoryId || !categoryIds.has(course.categoryId)
  })
  if (unknown.length > 0) {
    return { ok: false, error: 'unknownCourse', courses: unknown }
  }

  const unbookable = bookedSlugs.filter((slug) => {
    const course = coursesBySlug.get(slug)
    return course?.closed || course?.canceled
  })
  if (unbookable.length > 0) {
    return { ok: false, error: 'unbookable', courses: unbookable }
  }

  const discountRate = getDiscountRate(submission.discountCode ?? null)
  const pricing = createPricing({ ...catalog, discountRate })

  const attendees = submission.attendees.map((attendee) => ({
    ...attendee,
    priceTotal: pricing.getAttendeeTotalPrice(attendee),
  }))

  const seatLimits: Record<string, number> = {}
  for (const slug of bookedSlugs) {
    const seatLimit = parseSeatLimit(coursesBySlug.get(slug)?.seatLimit)
    if (seatLimit !== undefined) seatLimits[slug] = seatLimit
  }

  const { attendees: _, bookingKey: __, discountCode, ...booker } = submission

  return {
    ok: true,
    prepared: {
      booking: {
        ...booker,
        priceTotal: pricing.getTotalPrice(attendees),
        // Only a code that grants a discount is stored
        ...(discountRate > 0 && discountCode ? { discountCode } : {}),
      },
      attendees,
      seatLimits,
    },
  }
}
