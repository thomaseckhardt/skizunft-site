import type { Database } from '@/database.types'
import { faker } from '@faker-js/faker'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = await import.meta.env.PUBLIC_SUPABASE_API_URL
const supabaseKey = await import.meta.env.PUBLIC_SUPABASE_ANON_KEY

const testData = {
  first_name: faker.person.firstName(),
  last_name: faker.person.lastName(),
  email: faker.internet.email(),
  phone: faker.phone.imei(),
  street: faker.address.street(),
  city: faker.address.city(),
  postal_code: faker.address.zipCode(),
  country: faker.address.country(),
}

export default function BookingForm() {
  const supaClient = createClient<Database>(supabaseUrl, supabaseKey)
  supaClient
    .from('bookings')
    .select('*')
    .then(({ data }) => {
      console.log('data', data)
    })

  async function submitHandler(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    console.log('submit')

    const response = await supaClient.from('bookings').insert([{ ...testData }])
    console.log('response', response)
    const { data, error } = response

    if (!error) {
      console.log('data', data)
    } else {
      console.log('error', error)
    }
  }

  return (
    <div>
      <h1>Booking</h1>
      <form action="" onSubmit={submitHandler}>
        <button type="submit">Send</button>
      </form>
    </div>
  )
}
