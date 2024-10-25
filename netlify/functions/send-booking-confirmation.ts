import type { Handler } from '@netlify/functions'

import { sendEmail } from "@netlify/emails";

const handler: Handler = async function (event) {
  console.log('send-booking-confirmation handler')
  if (event.body === null) {
    return {
      statusCode: 400,
      body: JSON.stringify('Payload required'),
    }
  }

  // if (process.env.BOOKING_EMAIL_FROM) {
  //   return {
  //     statusCode: 400,
  //     body: JSON.stringify('Booking email address required'),
  //   }
  // }

  // Rename to requestBody
  const data = JSON.parse(event.body)

  if (!data.email) {
    return {
      statusCode: 400,
      body: JSON.stringify('Recipient email required'),
    }
  }

  console.log('send mail ')

    try {
      const result = await sendEmail({
      from: 'buchung@szkollnau.de',
      to: data.email,
      subject: `Deine Buchung ist bestätigt 🥳 #${data.orderNumber}`,
      template: "booking-confirmation",
      parameters: JSON.parse(event.body),
    });


    console.log('result', result)

    return {
      statusCode: 200,
      body: JSON.stringify('Booking confirmation email sent!'),
    }
  } catch (error) {
    console.log('error', error)
    return error
  }
}

export { handler }
