import type { Handler } from '@netlify/functions'

const handler: Handler = async function (event) {
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

  const data = JSON.parse(event.body)

  if (!data.email) {
    return {
      statusCode: 400,
      body: JSON.stringify('Recipient email required'),
    }
  }

  await fetch(
    `${process.env.URL}/.netlify/functions/emails/booking-notification`,
    {
      headers: {
        'netlify-emails-secret': process.env.NETLIFY_EMAILS_SECRET,
      },
      method: 'POST',
      body: JSON.stringify({
        from: 'buchung@szkollnau.de',
        to: 'mail@thomaseckhardt.com',
        subject: `🚨 Kursbuchung: ${data.firstName} ${data.lastName} #${data.orderNumber}`,
        parameters: JSON.parse(event.body),
      }),
    },
  )

  return {
    statusCode: 200,
    body: JSON.stringify('Booking notification email sent!'),
  }
}

export { handler }
