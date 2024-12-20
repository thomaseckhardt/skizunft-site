import BookingConfirmation from '@/components/booking/BookingConfirmation'
import BookingSelection from '@/components/booking/BookingSelection'
import BookingSteps from '@/components/booking/BookingSteps'
import { formatPrice } from '@/utils/format'
import { clsx } from 'clsx'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { api } from '../../../convex/_generated/api'
import useLocation from './useLocation'
import { DevTool } from '@hookform/devtools'
import { isDevelopment } from '@/utils/env'

const bookingSteps = [
  {
    index: 0,
    slug: 'selection',
    label: 'Kurs auswählen',
  },
  {
    index: 1,
    slug: 'booking',
    label: 'Kurs buchen',
  },
  {
    index: 2,
    slug: 'complete',
    label: 'Fertig!',
  },
]

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

const triggerNotificationMail = async (data) => {
  // console.log('triggerNotificationMail', data)
  try {
    const response = fetch(`/api/send-booking-notification-v2`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    // console.log('triggerNotificationMail', response)
    return {
      statusCode: 200,
    }
  } catch (error) {
    console.log('error', error)
    return error
  }
}

type FormValues = {
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
  // newsletterConfirmed: boolean
  // returningCustomer: boolean
  attendees: {
    firstName: string
    lastName: string
    age: number
    member: boolean
    courses: string[]
  }[]
}

export default function BookingForm({
  disciplines,
  courses,
  courseCategories,
}) {
  const [bookingStep, setBookingStep] = useState(bookingSteps[0])

  const insertBooking = useMutation(api.bookings.add)
  const insertAttendees = useMutation(api.attendees.addMultiple)
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const discountCode = params.get('code')
  const discountRate = discountCode === 'brettlemarkt2024' ? 0.1 : 0

  // --------------------------------------------------

  const getAttendeeTotalPrice = (attendee) => {
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

  const getSubtotal = (attendees) => {
    const attendeePrices = attendees.map((attendee) =>
      getAttendeeTotalPrice(attendee),
    )
    const total = attendeePrices.reduce((total, attendeePrice) => {
      return total + attendeePrice
    }, 0)

    return total
  }

  const getDiscountRate = () => {
    // const params = new URLSearchParams(location.search)
    // const discountCode = params.get('code')
    // const discountRate = discountCode === 'brettlemarkt2024' ? 0.1 : 0
    return discountRate
  }

  const getDiscount = (attendees) => {
    const discountRate = getDiscountRate()
    const subtotal = getSubtotal(attendees)
    const discount = subtotal * discountRate
    return discount
  }

  const getTotalPrice = (attendees) => {
    const discountRate = getDiscountRate()
    const subtotal = getSubtotal(attendees)
    const total = subtotal * (1 - discountRate)
    return total
  }

  // --------------------------------------------------

  const defaultAttendeeValues = {
    firstName: '',
    lastName: '',
    age: 6,
    member: false,
    courses: [],
  }

  // --------------------------------------------------

  const form = useForm<FormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      address: '',
      zip: '',
      city: '',
      country: '',
      email: '',
      phone: '',
      legalConfirmed: false,
      privacyConfirmed: false,
      attendees: [
        {
          ...defaultAttendeeValues,
        },
      ],
    },
  })
  const { register, control, handleSubmit, watch, formState } = form
  const { errors } = formState
  const attendeeFieldArray = useFieldArray({
    control,
    name: 'attendees',
  })

  const submit = async (data: FormValues, event) => {
    if (formState.isSubmitting) return
    event.preventDefault()

    const attendeesData = data.attendees.map((attendee) => {
      const priceTotal = getAttendeeTotalPrice(attendee)

      return {
        ...attendee,
        priceTotal,
      }
    })

    const bookingTotalPrice = getTotalPrice(attendeesData)

    const bookingData = {
      firstName: data.firstName,
      lastName: data.lastName,
      address: data.address,
      zip: data.zip,
      city: data.city,
      country: data.country,
      email: data.email,
      phone: data.phone,
      priceTotal: bookingTotalPrice,
      legalConfirmed: data.legalConfirmed,
      privacyConfirmed: data.privacyConfirmed,
      newsletterConfirmed: false,
      returningCustomer: false,
    }

    const { bookingId, orderNumber } = await insertBooking(bookingData)

    const attendeeIds = await insertAttendees({
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
          ? attendee.courses.map((courseSlug, index) => {
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
    } else {
      console.log('confirmationMail error')
    }
  }

  const attendees = useWatch({
    control,
    name: `attendees`,
  })

  // --------------------------------------------------

  const gotoStep = (index) => {
    const nextStep = bookingSteps[index]
    if (nextStep) {
      setBookingStep(nextStep)
      window.scrollTo(0, 0)
    }
  }

  const nextStep = () => {
    gotoStep(bookingStep?.index + 1)
  }

  const prevStep = () => {
    gotoStep(bookingStep?.index - 1)
  }

  // const insertTestData = () => {
  //   form.setValue('attendees', [
  //     {
  //       firstName: faker.person.firstName(),
  //       lastName: faker.person.lastName(),
  //       age: 6,
  //       member: true,
  //       courses: ['ski-beginner-1', 'ski-beginner-2'],
  //     },
  //   ])
  //   form.setValue('firstName', faker.person.firstName())
  //   form.setValue('lastName', faker.person.lastName())
  //   form.setValue('address', faker.location.streetAddress())
  //   form.setValue('zip', faker.location.zipCode())
  //   form.setValue('city', faker.location.city())
  //   form.setValue('country', faker.location.country())
  //   form.setValue('email', 'thomas.eckhardt@web.de')
  //   form.setValue('phone', faker.phone.imei())
  //   form.setValue('legalConfirmed', true)
  //   form.setValue('privacyConfirmed', true)
  // }

  return (
    <>
      <form onSubmit={handleSubmit(submit)} noValidate>
        {/* <button
          type="button"
          onClick={() => insertTestData()}
          className="absolute left-0 top-0 z-50 bg-purple-700 p-2 text-sm uppercase text-white"
        >
          Insert Test Data
        </button> */}
        <BookingSteps steps={bookingSteps} currentStep={bookingStep} />
        <div className="mt-10">
          <BookingSelection
            className={clsx(bookingStep?.slug !== 'selection' && 'sr-only')}
            defaultAttendeeValues={defaultAttendeeValues}
            attendeeFieldArray={attendeeFieldArray}
            register={register}
            errors={errors}
            control={control}
            nextStep={nextStep}
            courses={courses}
            courseCategories={courseCategories}
            getAttendeeTotalPrice={getAttendeeTotalPrice}
          />
          <BookingConfirmation
            className={clsx(bookingStep?.slug !== 'booking' && 'sr-only')}
            courses={courses}
            attendees={attendees}
            register={register}
            errors={errors}
            getAttendeeTotalPrice={getAttendeeTotalPrice}
            getSubtotal={getSubtotal}
            getDiscount={getDiscount}
            getTotalPrice={getTotalPrice}
            prevStep={prevStep}
            formState={formState}
          />
        </div>
      </form>
      {isDevelopment() && <DevTool control={control} />}
    </>
  )
}
