import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { faker } from '@faker-js/faker'
import { v4 as uuidv4 } from 'uuid'
import { useForm, useFieldArray } from 'react-hook-form'
import Icon from '@/components/Icon'
import BookingSteps from '@/components/booking/BookingSteps'
import BookingSelection from '@/components/booking/BookingSelection'
import BookingConfirmation from '@/components/booking/BookingConfirmation'

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
    const response = fetch(`./.netlify/functions/send-booking-confirmation`, {
      // fetch('http://localhost:9999/api/send-booking-confirmation', {
      method: 'POST',
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

const createDefaultAttendee = () => {
  return {
    key: uuidv4(),
    firstName: '',
    lastName: '',
    age: '',
    member: false,
    courses: [],
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
  newsletterConfirmed: boolean
  returningCustomer: boolean
  attendees: {
    firstName: string
    lastName: string
    age: number
    member: boolean
    courses: {
      id: string
      name: string
      date: string
    }[]
  }[]
}

export default function BookingForm({
  disciplines,
  courses,
  courseCategories,
}) {
  // console.log('disciplines', disciplines)
  // console.log('courses', courses)
  // console.log('courseCategories', courseCategories)

  const [bookingStep, setBookingStep] = useState(bookingSteps[0])

  const bookingData = {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    address: faker.location.streetAddress(),
    zip: faker.location.zipCode(),
    city: faker.location.city(),
    country: faker.location.country(),
    email: faker.internet.email(),
    phone: faker.phone.imei(),
    legalConfirmed: true,
    privacyConfirmed: true,
    newsletterConfirmed: false,
  }
  const attendeesData = [
    {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      age: faker.number.bigInt({ min: 18, max: 99 }),
      member: faker.datatype.boolean(),
      courses: ['course-1', 'course-2'],
    },
  ]

  const insertBooking = useMutation(api.bookings.add)
  const insertAttendee = useMutation(api.attendees.add)
  const testSubmit = async () => {
    console.log('submit')
    const bookingId = await insertBooking(bookingData)
    console.log('bookingId', bookingId)

    const attendeeData = attendeesData[0]
    const attendeeId = await insertAttendee({
      bookingId,
      ...attendeeData,
    })
    console.log('attendeeId', attendeeId)

    const mailingData = {
      firstName: bookingData.firstName,
      lastName: bookingData.lastName,
      address: bookingData.address,
      zip: bookingData.zip,
      city: bookingData.city,
      country: bookingData.country,
      email: bookingData.email,
      phone: bookingData.phone,
      attendees: attendeesData.map((attendee) => {
        const courses = attendee.courses.map((course, index) => {
          return {
            name: `Ski Beginner ${index + 1}`,
            date: '13./14.01.2024',
          }
        })

        return {
          firstName: attendee.firstName,
          lastName: attendee.lastName,
          age: attendee.age,
          member: attendee.member,
          price: '98,00 €',
          courses,
        }
      }),
    }
    const email = await triggerConfirmationMail(mailingData)
    console.log('email', email)
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
      newsletterConfirmed: false,
      returningCustomer: false,
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

  const submit = (data: FormValues, event) => {
    event.preventDefault()
    console.log('submit', data)
  }

  // --------------------------------------------------

  const nextStep = () => {
    console.log('nextStep')
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
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

        <BookingConfirmation />
        <button type="submit">Submit</button>
      </div>
    </form>
  )
}
