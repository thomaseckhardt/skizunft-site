import Icon from '@/components/Icon'
import BookingConfirmation from '@/components/booking/BookingConfirmation'
import BookingSelection from '@/components/booking/BookingSelection'
import BookingSteps from '@/components/booking/BookingSteps'
import { formatPrice } from '@/utils/format'
import { clsx } from 'clsx'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { api } from '../../../convex/_generated/api'

// TODO: Implement discount feature
// const DISCOUNT = 0.1
const DISCOUNT = 0

const triggerConfirmationMail = async (data) => {
  console.log('triggerConfirmationMail', data)
  try {
    const response = fetch(`/api/send-booking-confirmation`, {
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
    console.log('triggerConfirmationMail', response)
    return {
      statusCode: 200,
    }
  } catch (error) {
    console.log('error', error)
    return error
  }
}

const triggerNotificationMail = async (data) => {
  console.log('triggerNotificationMail', data)
  try {
    const response = fetch(`/api/send-booking-notification`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    console.log('triggerNotificationMail', response)
    return {
      statusCode: 200,
    }
  } catch (error) {
    console.log('error', error)
    return error
  }
}

type FormValues = {
  bookingData: string
  attendeeData: string
}

export default function BookingForm({ courses, courseCategories }) {
  const [mailingData, setMailingData] = useState({})

  const getAttendeeTotalPrice = (attendee) => {
    return attendee.courses.reduce((total, courseSlug) => {
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
  }

  const getSubtotal = (attendees) => {
    const attendeePrices = attendees.map((attendee) =>
      getAttendeeTotalPrice(attendee),
    )
    const total = attendeePrices.reduce((total, attendeePrice) => {
      return total + attendeePrice
    }, 0)

    return total
  }

  const getDiscount = (attendees) => {
    const subtotal = getSubtotal(attendees)
    const discount = subtotal * DISCOUNT
    return discount
  }

  const getTotalPrice = (attendees) => {
    const subtotal = getSubtotal(attendees)
    const total = subtotal * (1 - DISCOUNT)
    return total
  }

  const form = useForm<FormValues>({
    defaultValues: {
      bookingData: '{}',
      attendeeData: '[{}]',
    },
  })
  const { register, control, handleSubmit, watch, formState } = form
  const { errors } = formState

  const submit = async (data: FormValues, event) => {
    // if (formState.isSubmitted) return
    event.preventDefault()
    // console.log('SUBMIT', data)

    const bookingData = JSON.parse(data.bookingData)
    const attendeesData = JSON.parse(data.attendeeData)

    const mailingData = {
      firstName: bookingData.firstName.trim(),
      lastName: bookingData.lastName.trim(),
      address: bookingData.address.trim(),
      zip: bookingData.zip.trim(),
      city: bookingData.city.trim(),
      country: bookingData.country.trim(),
      email: bookingData.email.trim(),
      // email: 'thomas.eckhardt@web.de',
      phone: bookingData.phone,
      price: formatPrice(bookingData.priceTotal),
      subtotal: formatPrice(getSubtotal(attendeesData)),
      discount: formatPrice(getDiscount(attendeesData)),
      orderNumber: bookingData.orderNumber,

      attendees: attendeesData.map((attendee) => {
        const attendeeCourses = attendee.courses.map((courseSlug, index) => {
          const course = courses.find((course) => courseSlug === course.slug)
          return {
            name: course.name,
            date: course.dateShortFormatted,
          }
        })

        return {
          firstName: attendee.firstName.trim(),
          lastName: attendee.lastName.trim(),
          age: attendee.age,
          member: attendee.member,
          price: formatPrice(attendee.priceTotal),
          courses: attendeeCourses,
        }
      }),
    }
    setMailingData(mailingData)

    // const notificationMail = await triggerNotificationMail(mailingData)

    // console.log('notificationMail', notificationMail)

    // const confirmationMail = await triggerConfirmationMail(mailingData)

    // console.log('confirmationMail', confirmationMail)

    console.log('Submit', bookingData, attendeesData)
  }

  const sendConfirmationMail = async () => {
    if (mailingData?.email) {
      await triggerConfirmationMail(mailingData)
    }
  }

  const sendNotificationMail = async () => {
    if (mailingData?.email) {
      await triggerNotificationMail(mailingData)
    }
  }

  const labelClass = 'block text-sm font-medium leading-6 text-gray-900'
  const textAreaClass =
    'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <div className="grid gap-y-10">
        <div>
          <label htmlFor="bookingData" className={clsx(labelClass)}>
            Booking Data
          </label>
          <textarea
            id="bookingData"
            {...register('bookingData', { required: true })}
            className={clsx(textAreaClass)}
          ></textarea>
        </div>
        <div>
          <label htmlFor="attendeeData" className={clsx(labelClass)}>
            Attendee Data
          </label>
          <textarea
            id="attendeeData"
            {...register('attendeeData', { required: true })}
            className={clsx(textAreaClass)}
          ></textarea>
        </div>
        {Object.keys(errors).length > 0 && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="mt-[0.125em] flex-shrink-0 text-error-icon">
                <Icon name="error-circle-20-filled" size={20} />
              </div>
              <div className="ml-2">
                <h3 className="text-sm font-medium text-red-800">
                  Es gab {Object.keys(errors).length} Fehler bei deiner Eingabe:
                </h3>
                <div className="mt-2 text-xs text-red-700 md:text-sm">
                  <ul role="list" className="list-disc space-y-1 pl-5">
                    {Object.entries(errors).map(([fieldName, error]) => (
                      <li key={fieldName}>{error.message}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        <div>
          <button
            type="submit"
            className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Set Mailing Data
          </button>
        </div>
        {mailingData && (
          <>
            <div>
              <pre>{JSON.stringify(mailingData, null, 2)}</pre>
            </div>
            <div className="flex gap-x-10">
              <button
                type="button"
                className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={sendConfirmationMail}
              >
                Send&nbsp;<strong>confirmation</strong>&nbsp;mail to client
              </button>
              <button
                type="button"
                className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={sendNotificationMail}
              >
                Send&nbsp;<strong>notification</strong>&nbsp;mail to us
              </button>
            </div>
          </>
        )}
      </div>
    </form>
  )
}
