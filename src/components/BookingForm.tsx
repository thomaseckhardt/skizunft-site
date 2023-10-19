import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { faker } from '@faker-js/faker'

const triggerConfirmationMail = async (data) => {
  fetch(`./.netlify/functions/send-booking-confirmation`, {
    // fetch('http://localhost:9999/api/send-booking-confirmation', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export default function BookingForm() {
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

  const addBooking = useMutation(api.bookings.add)
  const addAttendee = useMutation(api.attendees.add)
  const submit = async () => {
    console.log('submit')
    const bookingId = await addBooking(bookingData)
    console.log('bookingId', bookingId)
    const attendeeId = await addAttendee({
      bookingId,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      age: faker.number.bigInt({ min: 18, max: 99 }),
      member: faker.datatype.boolean(),
      courses: ['course-1', 'course-2'],
    })
    console.log('attendeeId', attendeeId)
    const email = await triggerConfirmationMail(bookingData)
    console.log('email', email)
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <h1>BookingForm</h1>
      <button type="submit">Senden</button>
    </form>
  )
}
