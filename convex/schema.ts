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
    legalConfirmed: v.boolean(),
    privacyConfirmed: v.boolean(),
    newsletterConfirmed: v.boolean(),
  }),
  attendees: defineTable({
    bookingId: v.id('bookings'),
    firstName: v.string(),
    lastName: v.string(),
    age: v.int64(),
    member: v.boolean(),
    courses: v.array(v.string()),
  }),
})
