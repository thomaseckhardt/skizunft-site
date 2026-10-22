/**
 * Parses the body the Booking Flow posts to the booking submission.
 * Everything here comes from the browser, so nothing is trusted: strings
 * are trimmed and length-limited, and unknown fields are dropped.
 */

export type SubmittedAttendee = {
  firstName: string
  lastName: string
  age: number
  member: boolean
  courses: string[]
}

export type Submission = {
  firstName: string
  lastName: string
  address: string
  zip: string
  city: string
  country: string
  email: string
  phone: string
  legalConfirmed: true
  privacyConfirmed: true
  photoConsent: boolean
  attendees: SubmittedAttendee[]
  discountCode?: string
  bookingKey?: string
}

export type ParseResult =
  | { ok: true; submission: Submission }
  | { ok: false; error: string }

const MAX_ATTENDEES = 10
const MAX_COURSES_PER_ATTENDEE = 10
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

class InvalidField extends Error {}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

function text(
  source: Record<string, unknown>,
  field: string,
  { max, required = true }: { max: number; required?: boolean },
) {
  const value = source[field] ?? ''
  if (typeof value !== 'string') throw new InvalidField(field)
  const trimmed = value.trim()
  if (trimmed.length > max || (required && trimmed === '')) {
    throw new InvalidField(field)
  }
  return trimmed
}

function optionalText(
  source: Record<string, unknown>,
  field: string,
  max: number,
) {
  const value = text(source, field, { max, required: false })
  return value === '' ? undefined : value
}

function flag(source: Record<string, unknown>, field: string) {
  const value = source[field] ?? false
  if (typeof value !== 'boolean') throw new InvalidField(field)
  return value
}

function parseAttendee(value: unknown, index: number): SubmittedAttendee {
  if (!isRecord(value)) throw new InvalidField(`attendees[${index}]`)
  const { age, courses } = value
  if (typeof age !== 'number' || !Number.isInteger(age) || age < 0 || age > 120) {
    throw new InvalidField(`attendees[${index}].age`)
  }
  if (
    !Array.isArray(courses) ||
    courses.length === 0 ||
    courses.length > MAX_COURSES_PER_ATTENDEE ||
    courses.some((slug) => typeof slug !== 'string' || slug.length > 100) ||
    new Set(courses).size !== courses.length
  ) {
    throw new InvalidField(`attendees[${index}].courses`)
  }
  return {
    firstName: text(value, 'firstName', { max: 100 }),
    lastName: text(value, 'lastName', { max: 100 }),
    age,
    member: flag(value, 'member'),
    courses: courses as string[],
  }
}

export function parseSubmission(body: unknown): ParseResult {
  try {
    if (!isRecord(body)) throw new InvalidField('body')

    // Honeypot: the Booking Flow renders this field hidden, people leave it empty.
    if (optionalText(body, 'website', 1000) !== undefined) {
      throw new InvalidField('website')
    }

    const email = text(body, 'email', { max: 254 })
    if (!EMAIL_PATTERN.test(email)) throw new InvalidField('email')

    if (body.legalConfirmed !== true) throw new InvalidField('legalConfirmed')
    if (body.privacyConfirmed !== true) {
      throw new InvalidField('privacyConfirmed')
    }

    const { attendees } = body
    if (
      !Array.isArray(attendees) ||
      attendees.length === 0 ||
      attendees.length > MAX_ATTENDEES
    ) {
      throw new InvalidField('attendees')
    }

    return {
      ok: true,
      submission: {
        firstName: text(body, 'firstName', { max: 100 }),
        lastName: text(body, 'lastName', { max: 100 }),
        address: text(body, 'address', { max: 200 }),
        zip: text(body, 'zip', { max: 10 }),
        city: text(body, 'city', { max: 100 }),
        country: text(body, 'country', { max: 100, required: false }),
        email,
        phone: text(body, 'phone', { max: 40 }),
        legalConfirmed: true,
        privacyConfirmed: true,
        photoConsent: flag(body, 'photoConsent'),
        attendees: attendees.map(parseAttendee),
        discountCode: optionalText(body, 'discountCode', 50),
        bookingKey: optionalText(body, 'bookingKey', 200),
      },
    }
  } catch (error) {
    if (error instanceof InvalidField) {
      return { ok: false, error: `Invalid field: ${error.message}` }
    }
    throw error
  }
}
