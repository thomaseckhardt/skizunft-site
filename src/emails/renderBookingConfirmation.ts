import Handlebars from 'handlebars'
import mjml2html from 'mjml'
import template from './bookingConfirmationTemplate'

/**
 * Renders the booking confirmation mail to HTML.
 * Used by the send function and the local preview script.
 */
export function renderBookingConfirmation(payload: Record<string, unknown>) {
  const { html } = mjml2html(template, { validationLevel: 'strict' })
  return Handlebars.compile(html)(payload)
}
