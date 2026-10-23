import type { APIRoute } from 'astro'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../convex/_generated/api'
import { requireServerEnv } from '@/server/booking/env'
import { parseConsentLog } from '@/server/consent/parseConsentLog'

export const prerender = false

/**
 * Consent log of the cookie consent banner: stores every consent with its
 * consent id, so a consent can be proven later (Art. 7 (1) GDPR). Stores no
 * IP address. Rate limited by netlify/edge-functions/consent-rate-limit.ts.
 */
export const POST: APIRoute = async ({ request }) => {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new Response(null, { status: 400 })
  }

  const parsed = parseConsentLog(body)
  if (!parsed.ok) return new Response(null, { status: 400 })

  const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL)
  try {
    await convex.mutation(api.consents.log, {
      secret: requireServerEnv('ADMIN_API_SECRET'),
      consent: parsed.log,
    })
  } catch (error) {
    console.error('Could not store the consent', (error as Error)?.message)
    return new Response(null, { status: 500 })
  }
  return new Response(null, { status: 204 })
}
