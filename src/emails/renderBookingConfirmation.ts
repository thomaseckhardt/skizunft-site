import Handlebars from 'handlebars'
import mjml2html from 'mjml'
import { BANK_ACCOUNT, PAYMENT_DAYS_BEFORE_COURSE } from '../config/bank'
import {
  formatDueDate,
  formatIban,
  getGiroCodeUrl,
  getPaymentDueDate,
  getPaymentReference,
  isValidAmount,
} from '../utils/payment'
import template from './bookingConfirmationTemplate'

type RenderOptions = {
  /** Origin the GiroCode image is served from */
  origin: string
  now?: Date
  /** Replaces the GiroCode image URL, e.g. with a data URL in the preview */
  giroCodeSrc?: string
}

/**
 * Derives the payment details shown in the confirmation mail. Payloads from
 * clients that predate `amount` and `firstCourseStart` fall back to the
 * generic due date text and no GiroCode.
 */
export function getPaymentDetails(
  payload: Record<string, any>,
  { origin, now = new Date(), giroCodeSrc }: RenderOptions,
) {
  const reference = getPaymentReference(payload as any)
  const amount = Number(payload.amount)
  const firstCourseStart = payload.firstCourseStart
    ? new Date(payload.firstCourseStart)
    : undefined
  const dueDay = firstCourseStart
    ? getPaymentDueDate(firstCourseStart, now)
    : undefined

  return {
    reference,
    accountHolder: BANK_ACCOUNT.accountHolder,
    iban: formatIban(BANK_ACCOUNT.iban),
    bic: BANK_ACCOUNT.bic,
    bankName: BANK_ACCOUNT.bankName,
    daysBeforeCourse: PAYMENT_DAYS_BEFORE_COURSE,
    hasDueDate: dueDay !== undefined,
    dueDate: dueDay ? formatDueDate(dueDay) : null,
    giroCodeUrl: isValidAmount(amount)
      ? (giroCodeSrc ?? getGiroCodeUrl(origin, { amount, reference }))
      : null,
  }
}

/**
 * Renders the booking confirmation mail to HTML.
 * Used by the send function and the local preview script.
 */
export function renderBookingConfirmation(
  payload: Record<string, any>,
  options: RenderOptions,
) {
  const { html } = mjml2html(template, { validationLevel: 'strict' })
  return Handlebars.compile(html)({
    ...payload,
    payment: getPaymentDetails(payload, options),
  })
}
