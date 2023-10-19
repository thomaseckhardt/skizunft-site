import { v } from 'convex/values'
import { mutation } from './_generated/server'

export const add = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    address: v.string(),
    zip: v.string(),
    city: v.string(),
    country: v.string(),
    email: v.string(),
    phone: v.string(),
    legalConfirmed: v.boolean(),
    privacyConfirmed: v.boolean(),
    newsletterConfirmed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const boookingId = await ctx.db.insert('bookings', {
      firstName: args.firstName,
      lastName: args.lastName,
      address: args.address,
      zip: args.zip,
      city: args.city,
      country: args.country,
      email: args.email,
      phone: args.phone,
      legalConfirmed: args.legalConfirmed,
      privacyConfirmed: args.privacyConfirmed,
      newsletterConfirmed: args.newsletterConfirmed,
    })
    return boookingId
  },
})
