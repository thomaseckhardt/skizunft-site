import { v } from 'convex/values'
import type { QueryCtx } from './_generated/server'
import { query } from './_generated/server'
import { assertAdminSecret } from './adminSecret'

export const list = query({
  args: { secret: v.string() },
  handler: async (ctx, args) => {
    assertAdminSecret(args.secret)
    return await ctx.db.query('attendees').order('asc').take(1000)
  },
})

/** Seats taken per course slug by attendees who have not cancelled. */
export async function countSeatsTaken(ctx: QueryCtx) {
  const attendees = await ctx.db.query('attendees').collect()
  const seats: Record<string, number> = {}
  for (const attendee of attendees) {
    if (attendee.cancelled) continue
    for (const slug of attendee.courses) seats[slug] = (seats[slug] ?? 0) + 1
  }
  return seats
}

/**
 * Seats taken per course slug by attendees who have not cancelled.
 * Public, so it returns counts only and no personal data.
 */
export const seatsTaken = query({
  args: {},
  handler: async (ctx) => countSeatsTaken(ctx),
})
