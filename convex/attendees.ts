import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const list = query({
  args: { },
  handler: async (ctx, args) => {
    const attendees = await ctx.db
      .query("attendees")
      .order("asc")
      .take(1000);
    return attendees;
  },
});

export const add = mutation({
  args: {
    bookingId: v.id('bookings'),
    firstName: v.string(),
    lastName: v.string(),
    age: v.number(),
    member: v.boolean(),
    courses: v.array(v.string()),
    priceTotal: v.number(),
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
          ...attendee,
        })
        return attendeeId
      }),
    )
    return attendeeIds
  },
})
