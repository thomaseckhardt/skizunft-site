import * as brevo from '@getbrevo/brevo'
import mjml2html from 'mjml'
import emailMjml from './email-booking-notification'
import Handlebars from 'handlebars'

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

  const { html: emailTemplate } = mjml2html(emailMjml, {
    validationLevel: 'strict',
  })
  const emailHtml = Handlebars.compile(emailTemplate)({ ...payload })

  let apiInstance = new brevo.TransactionalEmailsApi()
  apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    Netlify.env.get('BREVO_API_KEY'),
  )

  let sendSmtpEmail = new brevo.SendSmtpEmail()

  sendSmtpEmail.subject = `🚨 ${payload.firstName} ${payload.lastName} #${payload.orderNumber}`
  sendSmtpEmail.htmlContent = emailHtml
  sendSmtpEmail.to = [{ email: 'info@szkollnau.de', name: 'Skizunft Kollnau' }]
  sendSmtpEmail.sender = { name: 'Booking', email: 'buchung@szkollnau.de' }

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
