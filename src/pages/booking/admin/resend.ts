import type { APIRoute } from 'astro'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { loadBookingData } from '@/data/booking'
import { getAdminConvex } from '@/server/booking/adminConvex'
import { requireServerEnv } from '@/server/booking/env'
import { fetchStoriesForEndpoint } from '@/server/booking/fetchStories'
import {
  mailingDataFromBooking,
  sendBookingMail,
  type BookingMail,
} from '@/server/booking/mails'

export const prerender = false

const mails: BookingMail[] = ['confirmation', 'notification']

/** Resends a booking mail from the local admin area. */
export const POST: APIRoute = async ({ request, redirect }) => {
  // The middleware already hides the admin area outside `astro dev`
  if (!import.meta.env.DEV) return new Response('Not found', { status: 404 })
  // Only the admin page on this dev server may trigger a mail
  if (request.headers.get('origin') !== new URL(request.url).origin) {
    return new Response('Forbidden', { status: 403 })
  }

  const form = await request.formData()
  const bookingId = String(form.get('bookingId') ?? '') as Id<'bookings'>
  const mail = String(form.get('mail') ?? '') as BookingMail
  if (!bookingId || !mails.includes(mail)) {
    return new Response('Invalid request', { status: 400 })
  }

  const { convex, secret } = getAdminConvex()
  const result = await convex.query(api.bookings.get, { secret, bookingId })
  if (!result?.booking.orderNumber) {
    return new Response('Booking not found', { status: 404 })
  }
  const { booking, attendees } = result
  const { courses } = await loadBookingData(fetchStoriesForEndpoint)

  const sent = await sendBookingMail(
    mail,
    mailingDataFromBooking({
      booking,
      orderNumber: booking.orderNumber!,
      attendees,
      courses,
    }),
    {
      apiKey: requireServerEnv('BREVO_API_KEY'),
      // The GiroCode image in the mail must point to the live site
      origin: import.meta.env.SITE,
    },
  )
  if (sent) {
    await convex.mutation(api.bookings.markMailSent, { secret, bookingId, mail })
  }

  const params = new URLSearchParams({
    mail,
    order: booking.orderNumber!,
    status: sent ? 'sent' : 'failed',
  })
  return redirect(`/booking/admin?${params}`, 303)
}
