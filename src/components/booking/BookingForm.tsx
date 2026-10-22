import BookingConfirmation from '@/components/booking/BookingConfirmation'
import BookingSelection from '@/components/booking/BookingSelection'
import BookingSteps from '@/components/booking/BookingSteps'
import { clsx } from 'clsx'
import { useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { createPricing, getDiscountRate } from './pricing'
import useLocation from './useLocation'
import useSubmitBooking, { type BookingValues } from './useSubmitBooking'
// import { DevTool } from '@hookform/devtools'
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

type FormValues = BookingValues

export default function BookingForm({
  disciplines,
  courses,
  courseCategories,
}) {
  const [bookingStep, setBookingStep] = useState(bookingSteps[0])

  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const discountRate = getDiscountRate(params.get('code'))

  // --------------------------------------------------

  const pricing = createPricing({ courses, courseCategories, discountRate })
  const { getAttendeeTotalPrice, getSubtotal, getDiscount, getTotalPrice } =
    pricing
  const submitBooking = useSubmitBooking({ courses, pricing })

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

    await submitBooking(data)
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
      {/* {isDevelopment() && <DevTool control={control} />} */}
    </>
  )
}
