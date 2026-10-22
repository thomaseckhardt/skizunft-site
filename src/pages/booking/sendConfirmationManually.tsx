import { buildMailingData } from '@/components/booking/buildMailingData'

const getAttendeeTotalPrice = ({ attendee, courses, courseCategories }) => {
  const total = Array.isArray(attendee?.courses)
    ? attendee?.courses?.reduce((total, courseSlug) => {
        const course = courses.find((course) => courseSlug === course.slug)
        const category = courseCategories.find(
          (category) => course.categoryId === category.id,
        ) ?? {
          price: 0,
          priceMember: 0,
        }
        const coursePrice = attendee.member
          ? category.priceMember
          : category.price
        return total + coursePrice
      }, 0)
    : 0

  return total
}

const getDiscountRate = () => {
  return 0.1
}

const getSubtotal = ({ attendees, courses, courseCategories }) => {
  const attendeePrices = attendees.map((attendee) =>
    getAttendeeTotalPrice({ attendee, courses, courseCategories }),
  )
  const total = attendeePrices.reduce((total, attendeePrice) => {
    return total + attendeePrice
  }, 0)

  return total
}

const getDiscount = ({ attendees, courses, courseCategories }) => {
  const discountRate = getDiscountRate()
  const subtotal = getSubtotal({ attendees, courses, courseCategories })
  const discount = subtotal * discountRate
  return discount
}

const getTotalPrice = ({ attendees, courses, courseCategories }) => {
  const discountRate = getDiscountRate()
  const subtotal = getSubtotal({ attendees, courses, courseCategories })
  const total = subtotal * (1 - discountRate)
  return total
}

const triggerConfirmationMail = async (data) => {
  try {
    const response = fetch(`/api/send-booking-confirmation-v2`, {
      method: 'POST',
      // NOTE: bigint values are not supported by JSON.stringify
      // I used as attendee.age which is now a number
      // Leave code for reference
      body: JSON.stringify(data, (key, value) => {
        // if (typeof value === 'bigint') {
        //   console.log('bigint', key, value)
        // }
        return typeof value === 'bigint' ? value.toString() : value
      }),
    })
    // console.log('triggerConfirmationMail', response)
    return response
  } catch (error) {
    console.log('error', error)
    return error
  }
}

export const sendConfirmationManually = async ({
  booking,
  courses,
  courseCategories,
}) => {
  const attendeesData = booking.attendees.map((attendee) => {
    const priceTotal = getAttendeeTotalPrice({
      attendee,
      courses,
      courseCategories,
    })

    return {
      ...attendee,
      priceTotal,
    }
  })

  console.log('attendeesData', attendeesData)

  const bookingTotalPrice = getTotalPrice({
    attendees: attendeesData,
    courses,
    courseCategories,
  })

  const bookingData = {
    firstName: booking.firstName,
    lastName: booking.lastName,
    address: booking.address,
    zip: booking.zip,
    city: booking.city,
    country: booking.country,
    email: booking.email,
    phone: booking.phone,
    priceTotal: bookingTotalPrice,
    legalConfirmed: booking.legalConfirmed,
    privacyConfirmed: booking.privacyConfirmed,
    newsletterConfirmed: false,
    returningCustomer: false,
    orderNumber: booking.orderNumber,
  }

  const mailingData = buildMailingData({
    booking: bookingData,
    orderNumber: bookingData.orderNumber,
    attendees: attendeesData,
    courses,
    subtotal: getSubtotal({
      attendees: attendeesData,
      courses,
      courseCategories,
    }),
    discount: getDiscount({
      attendees: attendeesData,
      courses,
      courseCategories,
    }),
  })

  console.log('Send confirmation mail', mailingData)

  const confirmationMail = await triggerConfirmationMail(mailingData)
  if (confirmationMail.status < 400) {
    console.log('Sending confirmation mail successful', confirmationMail)
  } else {
    console.log('Error while sending confirmation mail', confirmationMail)
  }

  return confirmationMail
}

export default sendConfirmationManually
