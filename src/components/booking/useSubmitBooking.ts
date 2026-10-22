import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { buildMailingData } from './buildMailingData'
import type { Pricing } from './pricing'

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
  attendees: {
    firstName: string
    lastName: string
    age: number
    member: boolean
    courses: string[]
  }[]
}

const triggerConfirmationMail = async (data) => {
  try {
    const response = fetch(`/api/send-booking-confirmation-v2`, {
      method: 'POST',
      // NOTE: bigint values are not supported by JSON.stringify
      // I used as attendee.age which is now a number
      // Leave code for reference
      body: JSON.stringify(data, (key, value) => {
        return typeof value === 'bigint' ? value.toString() : value
      }),
    })
    return response
  } catch (error) {
    console.log('error', error)
    return error
  }
}

const triggerNotificationMail = async (data) => {
  try {
    fetch(`/api/send-booking-notification-v2`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return {
      statusCode: 200,
    }
  } catch (error) {
    console.log('error', error)
    return error
  }
}

/**
 * Stores the booking with its attendees, sends the confirmation and
 * notification mails and redirects to the success page.
 * Resolves to false when the confirmation mail could not be sent.
 */
export default function useSubmitBooking({
  courses,
  pricing,
}: {
  courses: any[]
  pricing: Pricing
}) {
  const insertBooking = useMutation(api.bookings.add)
  const insertAttendees = useMutation(api.attendees.addMultiple)
  const { getAttendeeTotalPrice, getSubtotal, getDiscount, getTotalPrice } =
    pricing

  return async (data: BookingValues) => {
    const attendeesData = data.attendees.map((attendee) => ({
      ...attendee,
      priceTotal: getAttendeeTotalPrice(attendee),
    }))

    const bookingData = {
      firstName: data.firstName,
      lastName: data.lastName,
      address: data.address,
      zip: data.zip,
      city: data.city,
      country: data.country,
      email: data.email,
      phone: data.phone,
      priceTotal: getTotalPrice(attendeesData),
      legalConfirmed: data.legalConfirmed,
      privacyConfirmed: data.privacyConfirmed,
      newsletterConfirmed: false,
      photoConsent: data.photoConsent ?? false,
      returningCustomer: false,
    }

    const { bookingId, orderNumber } = await insertBooking(bookingData)

    await insertAttendees({
      attendees: attendeesData,
      bookingId,
    })

    const mailingData = buildMailingData({
      booking: bookingData,
      orderNumber,
      attendees: attendeesData,
      courses,
      subtotal: getSubtotal(attendeesData),
      discount: getDiscount(attendeesData),
    })

    triggerNotificationMail(mailingData)

    const confirmationMail = await triggerConfirmationMail(mailingData)
    if (confirmationMail.status < 400) {
      console.log('confirmationMail success')
      setTimeout(() => {
        window.location.replace('/buchung/erfolgreich')
      }, 100)
      return true
    }

    console.log('confirmationMail error')
    return false
  }
}
