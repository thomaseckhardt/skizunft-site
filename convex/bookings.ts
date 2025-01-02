import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

function generateOrderNumber() {
  const randomNumber = Math.floor(Math.random() * 900000) + 100000
  return `${randomNumber}`
}

export const list = query({
  args: {},
  handler: async (ctx, args) => {
    const bookings = await ctx.db.query('bookings').order('asc').take(1000)
    return bookings
  },
})

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
    priceTotal: v.number(),
    legalConfirmed: v.boolean(),
    privacyConfirmed: v.boolean(),
    newsletterConfirmed: v.boolean(),
    returningCustomer: v.boolean(),
  },
  handler: async (ctx, args) => {
    const orderNumber = generateOrderNumber()
    const bookingId = await ctx.db.insert('bookings', {
      firstName: args.firstName,
      lastName: args.lastName,
      address: args.address,
      zip: args.zip,
      city: args.city,
      country: args.country,
      email: args.email,
      phone: args.phone,
      priceTotal: args.priceTotal,
      legalConfirmed: args.legalConfirmed,
      privacyConfirmed: args.privacyConfirmed,
      newsletterConfirmed: args.newsletterConfirmed,
      returningCustomer: args.returningCustomer,
      orderNumber,
    })
    return { bookingId, orderNumber }
  },
})
