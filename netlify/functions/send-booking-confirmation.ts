import type { Handler } from '@netlify/functions'

const handler: Handler = async function (event) {
  if (event.body === null) {
    return {
      statusCode: 400,
      body: JSON.stringify('Payload required'),
    }
  }

  const data = JSON.parse(event.body)

  if (!data.email) {
    return {
      statusCode: 400,
      body: JSON.stringify('Recipient email required'),
    }
  }

  await fetch(
    `${process.env.URL}/.netlify/functions/emails/booking-confirmed`,
    {
      headers: {
        'netlify-emails-secret': process.env.NETLIFY_EMAILS_SECRET,
      },
      method: 'POST',
      body: JSON.stringify({
        // from: 'skischule@szkollnau.de',
        // to: data.email,
        from: 'mail@thomaseckhardt.com',
        to: 'mail@thomaseckhardt.com',
        subject: 'Deine Buchung ist bestätigt. Wir freuen uns!',
        parameters: JSON.parse(event.body),
      }),
    },
  )

  return {
    statusCode: 200,
    body: JSON.stringify('Booking confirmation email sent!'),
  }
}

export { handler }
