import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  bookings: defineTable({
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
    photoConsent: v.optional(v.boolean()),
    returningCustomer: v.boolean(),
    orderNumber: v.optional(v.string()),
    discountCode: v.optional(v.string()),
    confirmationSentAt: v.optional(v.number()),
    notificationSentAt: v.optional(v.number()),
  }).index('by_orderNumber', ['orderNumber']),
  attendees: defineTable({
    bookingId: v.id('bookings'),
    firstName: v.string(),
    lastName: v.string(),
    age: v.number(),
    member: v.boolean(),
    courses: v.array(v.string()),
    priceTotal: v.number(),
    cancelled: v.optional(v.boolean()),
  }).index('by_bookingId', ['bookingId']),
})
