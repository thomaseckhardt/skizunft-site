import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const list = query({
  args: {},
  handler: async (ctx, args) => {
    const attendees = await ctx.db.query('attendees').order('asc').take(1000)
    return attendees
  },
})

/**
 * Seats taken per course slug by attendees who have not cancelled.
 * Public, so it returns counts only and no personal data.
 */
export const seatsTaken = query({
  args: {},
  handler: async (ctx) => {
    const attendees = await ctx.db.query('attendees').collect()
    const seats: Record<string, number> = {}
    for (const attendee of attendees) {
      if (attendee.cancelled) continue
      for (const slug of attendee.courses) seats[slug] = (seats[slug] ?? 0) + 1
    }
    return seats
  },
})

export const add = mutation({
  args: {
    bookingId: v.id('bookings'),
    firstName: v.string(),
    lastName: v.string(),
    age: v.number(),
    member: v.boolean(),
    courses: v.array(v.string()),
    priceTotal: v.number(),
    cancelled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const attendeeId = await ctx.db.insert('attendees', {
      bookingId: args.bookingId,
      firstName: args.firstName,
      lastName: args.lastName,
      age: args.age,
      member: args.member,
      courses: args.courses,
      priceTotal: args.priceTotal,
      cancelled: args.cancelled || false,
    })
    return attendeeId
  },
})

export const addMultiple = mutation({
  args: {
    bookingId: v.id('bookings'),
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
  },
  handler: async (ctx, args) => {
    const attendeeIds = await Promise.all(
      args.attendees.map(async (attendee) => {
        const attendeeId = await ctx.db.insert('attendees', {
          bookingId: args.bookingId,
          ...{
            ...attendee,
            cancelled: false,
          },
        })
        return attendeeId
      }),
    )
    return attendeeIds
  },
})
