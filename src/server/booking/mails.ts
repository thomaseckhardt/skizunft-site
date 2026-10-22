import * as brevo from '@getbrevo/brevo'
import Handlebars from 'handlebars'
import mjml2html from 'mjml'
import { buildMailingData } from '../../components/booking/buildMailingData'
import notificationTemplate from '../../emails/bookingNotificationTemplate'
import { renderBookingConfirmation } from '../../emails/renderBookingConfirmation'

type StoredBooking = Parameters<typeof buildMailingData>[0]['booking']
type StoredAttendee = Parameters<typeof buildMailingData>[0]['attendees'][number]

export type MailingData = ReturnType<typeof buildMailingData>
export type BookingMail = 'confirmation' | 'notification'

/**
 * Mail payload from a stored booking. Subtotal and discount are derived from
 * the stored prices, so a resent mail shows the amounts of the booking.
 */
export function mailingDataFromBooking({
  booking,
  orderNumber,
  attendees,
  courses,
}: {
  booking: StoredBooking
  orderNumber: string
  attendees: StoredAttendee[]
  courses: any[]
}) {
  const subtotal = attendees.reduce((sum, a) => sum + a.priceTotal, 0)
  return buildMailingData({
    booking,
    orderNumber,
    attendees,
    courses,
    subtotal,
    discount: subtotal - booking.priceTotal,
  })
}

function buildMail(
  mail: BookingMail,
  data: MailingData,
  { origin }: { origin: string },
) {
  const email = new brevo.SendSmtpEmail()
  if (mail === 'confirmation') {
    email.subject = `Deine Buchung ist bestätigt 🥳 #${data.orderNumber}`
    email.htmlContent = renderBookingConfirmation(data, { origin })
    email.to = [
      { email: data.email, name: `${data.firstName} ${data.lastName}` },
    ]
    email.sender = { name: 'Skizunft Kollnau', email: 'buchung@szkollnau.de' }
    email.replyTo = { email: 'info@szkollnau.de', name: 'Skizunft Kollnau' }
  } else {
    const { html } = mjml2html(notificationTemplate, {
      validationLevel: 'strict',
    })
    email.subject = `🚨 ${data.firstName} ${data.lastName} #${data.orderNumber}`
    email.htmlContent = Handlebars.compile(html)(data)
    email.to = [{ email: 'info@szkollnau.de', name: 'Skizunft Kollnau' }]
    email.sender = { name: 'Booking', email: 'buchung@szkollnau.de' }
  }
  return email
}

/**
 * Sends one booking mail through Brevo. Resolves to whether Brevo accepted
 * it. Logs status codes only, never the mail content.
 */
export async function sendBookingMail(
  mail: BookingMail,
  data: MailingData,
  { apiKey, origin }: { apiKey: string; origin: string },
) {
  const api = new brevo.TransactionalEmailsApi()
  api.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey)
  try {
    const result = await api.sendTransacEmail(buildMail(mail, data, { origin }))
    const status = result.response?.statusCode ?? 500
    if (status < 400) return true
    console.error(`Sending the ${mail} mail failed`, { status })
    return false
  } catch (error: any) {
    console.error(`Sending the ${mail} mail failed`, {
      status: error?.statusCode,
      code: error?.body?.code,
    })
    return false
  }
}
