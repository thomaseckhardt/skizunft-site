import type { APIRoute } from 'astro'
import { ConvexError } from 'convex/values'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { bookingEnabled, internalBookingKey, loadBookingData } from '@/data/booking'
import { requireServerEnv } from '@/server/booking/env'
import { mailingDataFromBooking, sendBookingMail } from '@/server/booking/mails'
import { parseSubmission } from '@/server/booking/parseSubmission'
import { prepareBooking } from '@/server/booking/prepareBooking'
import { getPaymentReference } from '@/utils/payment'

export const prerender = false

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

/**
 * Booking submission of the Booking Flow: validates the booking, calculates
 * the prices, stores it and sends the confirmation and notification mails.
 * Rate limited by netlify/edge-functions/booking-rate-limit.ts.
 */
export const POST: APIRoute = async ({ request }) => {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json({ error: 'invalid' }, 400)
  }

  const parsed = parseSubmission(body)
  if (!parsed.ok) return json({ error: 'invalid' }, 400)
  const { submission } = parsed

  const hasInternalKey =
    internalBookingKey !== '' && submission.bookingKey === internalBookingKey
  if (!bookingEnabled && !hasInternalKey) return json({ error: 'closed' }, 403)

  let catalog: Awaited<ReturnType<typeof loadBookingData>>
  try {
    catalog = await loadBookingData()
  } catch (error) {
    console.error('Could not load the course catalog', error)
    return json({ error: 'unavailable' }, 503)
  }

  const result = prepareBooking(submission, catalog)
  if (!result.ok) return json({ error: result.error, courses: result.courses }, 409)
  const { prepared } = result

  const secret = requireServerEnv('ADMIN_API_SECRET')
  const mailOptions = {
    apiKey: requireServerEnv('BREVO_API_KEY'),
    origin: new URL(request.url).origin,
  }
  const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL)

  let stored: { bookingId: Id<'bookings'>; orderNumber: string }
  try {
    stored = await convex.mutation(api.bookings.create, { secret, ...prepared })
  } catch (error) {
    if (error instanceof ConvexError && error.data?.code === 'fullyBooked') {
      return json({ error: 'fullyBooked', courses: error.data.courses }, 409)
    }
    console.error('Could not store the booking', (error as Error)?.message)
    return json({ error: 'failed' }, 500)
  }
  const { bookingId } = stored

  // The booking is stored from here on. A failed mail doesn't undo it: the
  // sent-at field stays empty and the mail can be resent from the admin area.
  const mailingData = mailingDataFromBooking({
    ...prepared,
    orderNumber: stored.orderNumber,
    courses: catalog.courses,
  })
  const sent = { confirmation: false, notification: false }
  for (const mail of ['confirmation', 'notification'] as const) {
    sent[mail] = await sendBookingMail(mail, mailingData, mailOptions)
    if (sent[mail]) {
      await convex
        .mutation(api.bookings.markMailSent, { secret, bookingId, mail })
        .catch((error) =>
          console.error('Could not mark the mail as sent', {
            bookingId,
            mail,
            message: error?.message,
          }),
        )
    } else {
      console.error('Booking mail not sent', { bookingId, mail })
    }
  }

  return json({
    orderNumber: stored.orderNumber,
    amount: mailingData.amount,
    reference: getPaymentReference(mailingData),
    firstCourseStart: mailingData.firstCourseStart,
    confirmationSent: sent.confirmation,
  })
}
