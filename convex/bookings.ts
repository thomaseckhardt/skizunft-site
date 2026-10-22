import { ConvexError, v } from 'convex/values'
import type { MutationCtx } from './_generated/server'
import { mutation, query } from './_generated/server'
import { assertAdminSecret } from './adminSecret'
import { countSeatsTaken } from './attendees'

async function generateOrderNumber(ctx: MutationCtx) {
  for (;;) {
    const orderNumber = `${Math.floor(Math.random() * 900000) + 100000}`
    const existing = await ctx.db
      .query('bookings')
      .withIndex('by_orderNumber', (q) => q.eq('orderNumber', orderNumber))
      .first()
    if (!existing) return orderNumber
  }
}

export const list = query({
  args: { secret: v.string() },
  handler: async (ctx, args) => {
    assertAdminSecret(args.secret)
    return await ctx.db.query('bookings').order('asc').take(1000)
  },
})

/** One booking with its attendees, or null. */
export const get = query({
  args: { secret: v.string(), bookingId: v.id('bookings') },
  handler: async (ctx, args) => {
    assertAdminSecret(args.secret)
    const booking = await ctx.db.get(args.bookingId)
    if (!booking) return null
    const attendees = await ctx.db
      .query('attendees')
      .withIndex('by_bookingId', (q) => q.eq('bookingId', args.bookingId))
      .collect()
    return { booking, attendees }
  },
})

/**
 * Stores a booking with its attendees. Only the booking submission calls
 * this, after it validated the booking and calculated the prices. The seat
 * check runs here, inside the transaction, so two bookings can't both take
 * the last seat.
 */
export const create = mutation({
  args: {
    secret: v.string(),
    booking: v.object({
      firstName: v.string(),
      lastName: v.string(),
      address: v.string(),
      zip: v.string(),
      city: v.string(),
      country: v.string(),
      email: v.string(),
      phone: v.string(),
      priceTotal: v.number(),
      legalConfirmed: v.boolean(),
      privacyConfirmed: v.boolean(),
      photoConsent: v.boolean(),
      discountCode: v.optional(v.string()),
    }),
    attendees: v.array(
      v.object({
        firstName: v.string(),
        lastName: v.string(),
        age: v.number(),
        member: v.boolean(),
        courses: v.array(v.string()),
        priceTotal: v.number(),
      }),
    ),
    /** Seat limits of the booked courses that have one */
    seatLimits: v.record(v.string(), v.number()),
  },
  handler: async (ctx, args) => {
    assertAdminSecret(args.secret)

    const seatsTaken = await countSeatsTaken(ctx)
    for (const attendee of args.attendees) {
      for (const slug of attendee.courses) {
        seatsTaken[slug] = (seatsTaken[slug] ?? 0) + 1
      }
    }
    const fullyBooked = Object.entries(args.seatLimits)
      .filter(([slug, seatLimit]) => (seatsTaken[slug] ?? 0) > seatLimit)
      .map(([slug]) => slug)
    if (fullyBooked.length > 0) {
      throw new ConvexError({ code: 'fullyBooked', courses: fullyBooked })
    }

    const orderNumber = await generateOrderNumber(ctx)
    const bookingId = await ctx.db.insert('bookings', {
      ...args.booking,
      newsletterConfirmed: false,
      returningCustomer: false,
      orderNumber,
    })
    for (const attendee of args.attendees) {
      await ctx.db.insert('attendees', {
        ...attendee,
        bookingId,
        cancelled: false,
      })
    }
    return { bookingId, orderNumber }
  },
})

export const markMailSent = mutation({
  args: {
    secret: v.string(),
    bookingId: v.id('bookings'),
    mail: v.union(v.literal('confirmation'), v.literal('notification')),
  },
  handler: async (ctx, args) => {
    assertAdminSecret(args.secret)
    const field =
      args.mail === 'confirmation' ? 'confirmationSentAt' : 'notificationSentAt'
    await ctx.db.patch(args.bookingId, { [field]: Date.now() })
  },
})
