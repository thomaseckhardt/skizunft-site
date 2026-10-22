import * as brevo from '@getbrevo/brevo'
import { renderBookingConfirmation } from '@/emails/renderBookingConfirmation'

export default async function (req: Request) {
  if (req.body === null) {
    return new Response('Payload required', {
      status: 400,
    })
  }

  let payload
  try {
    payload = await req.json()
  } catch (error) {
    return new Response('Invalid JSON', {
      status: 400,
    })
  }

  if (!payload.email) {
    return new Response('Recipient email required', {
      status: 400,
    })
  }

  const emailHtml = renderBookingConfirmation(payload, {
    origin: new URL(req.url).origin,
  })

  let apiInstance = new brevo.TransactionalEmailsApi()
  apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    Netlify.env.get('BREVO_API_KEY'),
  )

  let sendSmtpEmail = new brevo.SendSmtpEmail()

  sendSmtpEmail.subject = `Deine Buchung ist bestätigt 🥳 #${payload.orderNumber}`
  sendSmtpEmail.htmlContent = emailHtml
  sendSmtpEmail.to = [
    { email: payload.email, name: `${payload.firstName} ${payload.lastName}` },
  ]
  sendSmtpEmail.sender = {
    name: 'Skizunft Kollnau',
    email: 'buchung@szkollnau.de',
  }
  sendSmtpEmail.replyTo = {
    email: 'info@szkollnau.de',
    name: 'Skizunft Kollnau',
  }
  // sendSmtpEmail.headers = { "Some-Custom-Name": "unique-id-1234" };
  // sendSmtpEmail.params = { ...payload };

  try {
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
    if (result.response?.statusCode < 400) {
      return new Response('Email sent successfully', {
        status: result.response.statusCode,
        statusText: result.response.statusMessage,
      })
    } else {
      return new Response('Error sending confirmation email', {
        status: result.response.statusCode,
        statusText: result.response.statusMessage,
      })
    }
  } catch (error) {
    console.log('Error sending confirmation email', {
      ...(error?.body ? error.body : undefined),
    })
    return new Response('Error sending confirmation email', {
      status: error.statusCode,
      statusText: error.body?.message,
    })
  }
}
