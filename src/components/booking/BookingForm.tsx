import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { faker } from '@faker-js/faker'
import { useForm, useFieldArray } from 'react-hook-form'
import BookingSteps from '@/components/booking/BookingSteps'
import BookingSelection from '@/components/booking/BookingSelection'
import BookingConfirmation from '@/components/booking/BookingConfirmation'
import { formatPrice } from '@/utils/formats'

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
  console.log('triggerConfirmationMail', data)
  try {
    const response = fetch(`/api/send-booking-confirmation`, {
      method: 'POST',
      // NOTE: bigint values are not supported by JSON.stringify
      // I used as attendee.age which is now a number
      // Leave code for reference
      body: JSON.stringify(data, (key, value) => {
        if (typeof value === 'bigint') {
          console.log('bigint', key, value)
        }
        return typeof value === 'bigint' ? value.toString() : value
      }),
    })
    console.log('email', response)
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
    event.preventDefault()
    console.log('SUBMIT', data)

    const attendeesData = data.attendees.map((attendee) => {
      const priceTotal = attendee.courses.reduce((total, courseSlug) => {
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

      return {
        ...attendee,
        priceTotal,
      }
    })

    const bookingTotalPrice = attendeesData.reduce((total, attendee) => {
      return total + attendee.priceTotal
    }, 0)

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
    console.log('bookingId', bookingId)

    const attendeeIds = await insertAttendees({
      attendees: attendeesData,
      bookingId,
    })
    console.log('attendeeIds', attendeeIds)

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
      orderNumber,

      attendees: attendeesData.map((attendee) => {
        const attendeeCourses = attendee.courses.map((courseSlug, index) => {
          const course = courses.find((course) => courseSlug === course.slug)
          return {
            name: course.name,
            date: course.dateShortFormatted,
          }
        })

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

    const email = await triggerConfirmationMail(mailingData)
    console.log('email', email)
  }

  // --------------------------------------------------

  const nextStep = () => {
    console.log('nextStep')
  }

  const insertTestData = () => {
    form.setValue('attendees', [
      {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        age: 6,
        member: true,
        courses: ['ski-beginner-1', 'ski-beginner-2'],
      },
    ])
    form.setValue('firstName', faker.person.firstName())
    form.setValue('lastName', faker.person.lastName())
    form.setValue('address', faker.location.streetAddress())
    form.setValue('zip', faker.location.zipCode())
    form.setValue('city', faker.location.city())
    form.setValue('country', faker.location.country())
    form.setValue('email', faker.internet.email())
    form.setValue('phone', faker.phone.imei())
    form.setValue('legalConfirmed', true)
    form.setValue('privacyConfirmed', true)
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <button type="button" onClick={() => insertTestData()}>
        Insert Test Data
      </button>
      <BookingSteps steps={bookingSteps} currentStep={bookingStep} />
      <div className="mt-10">
        <BookingSelection
          disciplines={disciplines}
          defaultAttendeeValues={defaultAttendeeValues}
          attendeeFieldArray={attendeeFieldArray}
          register={register}
          errors={errors}
          control={control}
          nextStep={nextStep}
          courses={courses}
          courseCategories={courseCategories}
        />

        <BookingConfirmation
          register={register}
          errors={errors}
          control={control}
          formState={formState}
        />
        <button type="submit">Submit</button>
      </div>
    </form>
  )
}
