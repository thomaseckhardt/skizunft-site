import { savePaymentSession } from './paymentSession'

export type BookingValues = {
  firstName: string
  lastName: string
  address: string
  zip: string
  city: string
  country: string
  email: string
  phone: string
  legalConfirmed: boolean
  privacyConfirmed: boolean
  photoConsent?: boolean
  /** Honeypot field, rendered hidden. People leave it empty. */
  website?: string
  attendees: {
    firstName: string
    lastName: string
    age: number
    member: boolean
    courses: string[]
  }[]
}

type SubmitResponse = {
  orderNumber: string
  amount: number
  reference: string
  firstCourseStart?: string
  confirmationSent: boolean
}

/**
 * Posts the booking to the booking submission, which calculates the prices,
 * stores the booking and sends the mails, then redirects to the success
 * page. Resolves to false when the booking was stored but the confirmation
 * mail could not be sent. Throws when the booking was not stored.
 */
export default function useSubmitBooking() {
  return async (values: BookingValues) => {
    const params = new URLSearchParams(window.location.search)
    const response = await fetch('/buchung/absenden', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...values,
        discountCode: params.get('code') ?? undefined,
        bookingKey: params.get('key') ?? undefined,
      }),
    })
    if (!response.ok) {
      throw new Error(`Booking submission failed: ${response.status}`)
    }

    const result: SubmitResponse = await response.json()
    if (!result.confirmationSent) return false

    savePaymentSession({
      amount: result.amount,
      reference: result.reference,
      firstCourseStart: result.firstCourseStart,
    })
    setTimeout(() => {
      window.location.replace('/buchung/erfolgreich')
    }, 100)
    return true
  }
}
