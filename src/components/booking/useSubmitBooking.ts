import { formatPrice } from '@/utils/format'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
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

    const mailingData = {
      firstName: bookingData.firstName,
      lastName: bookingData.lastName,
      address: bookingData.address,
      zip: bookingData.zip,
      city: bookingData.city,
      country: bookingData.country,
      email: bookingData.email,
      phone: bookingData.phone,
      price: formatPrice(bookingData.priceTotal),
      subtotal: formatPrice(getSubtotal(attendeesData)),
      discount: formatPrice(getDiscount(attendeesData)),
      orderNumber,

      attendees: attendeesData.map((attendee) => {
        const attendeeCourses = Array.isArray(attendee.courses)
          ? attendee.courses.map((courseSlug) => {
              const course = courses.find(
                (course) => courseSlug === course.slug,
              )
              return {
                name: course.name,
                date: course.dateShortFormatted,
              }
            })
          : []

        return {
          firstName: attendee.firstName,
          lastName: attendee.lastName,
          age: attendee.age,
          member: attendee.member,
          price: formatPrice(attendee.priceTotal),
          courses: attendeeCourses,
        }
      }),
    }

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
