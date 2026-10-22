import { formatPrice } from '../../utils/format'

type MailingBooking = {
  firstName: string
  lastName: string
  address: string
  zip: string
  city: string
  country: string
  email: string
  phone: string
  priceTotal: number
}

type MailingAttendee = {
  firstName: string
  lastName: string
  age: number
  member: boolean
  courses: string[]
  priceTotal: number
}

/**
 * Payload for the confirmation and notification mails. `amount` and
 * `firstCourseStart` are raw values the confirmation mail derives the
 * payment due date and the GiroCode from.
 */
export function buildMailingData({
  booking,
  orderNumber,
  attendees,
  courses,
  subtotal,
  discount,
}: {
  booking: MailingBooking
  orderNumber: string
  attendees: MailingAttendee[]
  courses: any[]
  subtotal: number
  discount: number
}) {
  const findCourse = (slug: string) =>
    courses.find((course) => course.slug === slug)

  const courseStarts = attendees
    .flatMap((attendee) => attendee.courses ?? [])
    .map((slug) => findCourse(slug)?.startDate)
    .filter(Boolean)
    .map((startDate) => new Date(startDate).getTime())
  const firstCourseStart = courseStarts.length
    ? new Date(Math.min(...courseStarts)).toISOString()
    : undefined

  return {
    firstName: booking.firstName,
    lastName: booking.lastName,
    address: booking.address,
    zip: booking.zip,
    city: booking.city,
    country: booking.country,
    email: booking.email,
    phone: booking.phone,
    price: formatPrice(booking.priceTotal),
    amount: booking.priceTotal,
    subtotal: formatPrice(subtotal),
    discount: formatPrice(discount),
    orderNumber,
    firstCourseStart,

    attendees: attendees.map((attendee) => ({
      firstName: attendee.firstName,
      lastName: attendee.lastName,
      age: attendee.age,
      member: attendee.member,
      price: formatPrice(attendee.priceTotal),
      courses: (attendee.courses ?? []).map((slug) => {
        const course = findCourse(slug)
        return {
          name: course?.name,
          date: course?.dateShortFormatted,
        }
      }),
    })),
  }
}
