import { ConvexError } from 'convex/values'

/**
 * Server-side callers (booking submission, sync, local admin) pass the
 * secret shared via `ADMIN_API_SECRET`. Fails closed while it is not set.
 */
export function assertAdminSecret(secret: string) {
  const expected = process.env.ADMIN_API_SECRET
  if (!expected || !safeEqual(secret, expected)) {
    throw new ConvexError('Unauthorized')
  }
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
