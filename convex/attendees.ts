import { v } from 'convex/values'
import { mutation } from './_generated/server'

export const add = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    age: v.int64(),
    member: v.boolean(),
    courses: v.array(v.string()),
    bookingId: v.id('bookings'),
  },
  handler: async (ctx, args) => {
    const attendeeId = await ctx.db.insert('attendees', {
      firstName: args.firstName,
      lastName: args.lastName,
      age: args.age,
      member: args.member,
      courses: args.courses,
      bookingId: args.bookingId,
    })
    return attendeeId
  },
})
