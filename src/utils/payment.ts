import { BANK_ACCOUNT, PAYMENT_DAYS_BEFORE_COURSE } from '../config/bank'

const TIME_ZONE = 'Europe/Berlin'

// en-CA formats as YYYY-MM-DD
const isoDayFormat = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE })

const dueDateFormat = new Intl.DateTimeFormat('de-DE', {
  timeZone: 'UTC',
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

/** Max length of the unstructured remittance information in a SEPA transfer. */
export const MAX_REFERENCE_LENGTH = 140

const MIN_AMOUNT = 0.01
const MAX_AMOUNT = 999_999_999.99
const MAX_EPC_PAYLOAD_BYTES = 331

/**
 * Calendar day (YYYY-MM-DD) by which the course fees must be paid, or null
 * when they are due immediately because that day has already passed.
 */
export function getPaymentDueDate(
  firstCourseStart: Date,
  now: Date = new Date(),
): string | null {
  const courseDay = new Date(
    `${isoDayFormat.format(firstCourseStart)}T12:00:00Z`,
  )
  courseDay.setUTCDate(courseDay.getUTCDate() - PAYMENT_DAYS_BEFORE_COURSE)
  const dueDay = courseDay.toISOString().slice(0, 10)

  return dueDay < isoDayFormat.format(now) ? null : dueDay
}

/** Formats a YYYY-MM-DD day as e.g. "Montag, 28.12.2026". */
export function formatDueDate(day: string): string {
  return dueDateFormat.format(new Date(`${day}T12:00:00Z`))
}

/** Groups an IBAN in blocks of four for display. */
export function formatIban(iban: string): string {
  return iban.replace(/\s/g, '').replace(/(.{4})(?=.)/g, '$1 ')
}

export function getPaymentReference({
  orderNumber,
  firstName,
  lastName,
}: {
  orderNumber: string
  firstName: string
  lastName: string
}): string {
  return `${orderNumber} ${firstName} ${lastName}`
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_REFERENCE_LENGTH)
}

export function isValidAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount >= MIN_AMOUNT && amount <= MAX_AMOUNT
}

/** URL of the GiroCode image served by netlify/functions/girocode.ts */
export function getGiroCodeUrl(
  origin: string,
  { amount, reference }: { amount: number; reference: string },
): string {
  const params = new URLSearchParams({
    amount: amount.toFixed(2),
    ref: reference,
  })
  return `${origin}/api/girocode?${params}`
}

/**
 * Builds the text of an EPC QR code ("GiroCode") for a SEPA credit transfer
 * to the club's account. Throws when the amount or reference is not allowed.
 * Spec: EPC069-12, version 002, UTF-8.
 */
export function buildEpcPayload({
  amount,
  reference,
}: {
  amount: number
  reference: string
}): string {
  if (!isValidAmount(amount)) {
    throw new RangeError(`Invalid amount: ${amount}`)
  }
  if (reference.length > MAX_REFERENCE_LENGTH || /[\r\n]/.test(reference)) {
    throw new RangeError('Invalid reference')
  }

  const payload = [
    'BCD',
    '002',
    '1',
    'SCT',
    BANK_ACCOUNT.bic,
    BANK_ACCOUNT.accountHolder,
    BANK_ACCOUNT.iban,
    `EUR${amount.toFixed(2)}`,
    '', // purpose code
    '', // structured reference
    reference,
  ].join('\n')

  if (new TextEncoder().encode(payload).length > MAX_EPC_PAYLOAD_BYTES) {
    throw new RangeError('EPC payload too long')
  }
  return payload
}
