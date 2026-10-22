import type { Handler } from '@netlify/functions';

const handler: Handler = async function (event) {
  console.log('send-booking-confirmation handler');
  if (event.body === null) {
    return {
      statusCode: 400,
      body: JSON.stringify('Payload required')
    };
  }

  // Rename to requestBody
  const data = JSON.parse(event.body);

  if (!data.email) {
    return {
      statusCode: 400,
      body: JSON.stringify('Recipient email required')
    };
  }

  console.log('send mail to ', data.email);

  try {
    const result = await fetch(
      `${process.env.URL}/.netlify/functions/emails/booking-confirmation`,
      {
        headers: {
          'netlify-emails-secret': process.env.NETLIFY_EMAILS_SECRET
        },
        method: 'POST',
        body: JSON.stringify({
          from: 'buchung@szkollnau.de',
          to: data.email,
          subject: `Deine Buchung ist bestätigt 🥳 #${data.orderNumber}`,
          template: 'booking-confirmation',
          parameters: JSON.parse(event.body),
          MessageStream: 'booking-confirmation'
        })
      }
    );

    console.log('result', result);

    return {
      statusCode: 200,
      body: JSON.stringify('Booking confirmation email sent!')
    };
  } catch (error) {
    console.log('error', error);
    return error;
  }
};

export { handler };
