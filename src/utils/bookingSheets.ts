import type { Doc } from '../../convex/_generated/dataModel'
import { parseSeatLimit } from '../components/booking/flow/availability'
import type { SheetRow } from './googleSheets'

type Booking = Doc<'bookings'>
type Attendee = Doc<'attendees'>
type CourseStory = { slug: string; content?: { seatLimit?: unknown } }

export type BookingSheet = { tabName: string; data: SheetRow[] }

const COURSE_ORDER = [
  'ski-bambini',
  'ski-beginner',
  'ski-junior-champion',
  'ski-champion',
  'ski-erwachsene',
  'snowboard',
]

// Helpers to sort course slugs like "ski-beginner-1", "ski-beginner-2" by
// base category order (COURSE_ORDER) and then numeric suffix.
const splitCourseSlug = (slug: string) => {
  const lastDash = slug.lastIndexOf('-')
  if (lastDash > -1) {
    const maybeNum = slug.slice(lastDash + 1)
    if (/^\d+$/.test(maybeNum)) {
      return { base: slug.slice(0, lastDash), index: parseInt(maybeNum, 10) }
    }
  }
  return { base: slug, index: 0 }
}

const courseOrderIndex = (base: string) => {
  const idx = COURSE_ORDER.findIndex((prefix) => base.startsWith(prefix))
  return idx === -1 ? Number.MAX_SAFE_INTEGER : idx
}

export const sortCourses = (a: string, b: string) => {
  const A = splitCourseSlug(a)
  const B = splitCourseSlug(b)
  const oa = courseOrderIndex(A.base)
  const ob = courseOrderIndex(B.base)
  if (oa !== ob) return oa - ob
  if (A.base !== B.base) return A.base.localeCompare(B.base)
  return A.index - B.index
}

export const formatDateTime = (time: number | Date) =>
  new Date(time).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })

/**
 * Rows are written as if typed into the sheet, so text a booker entered
 * could turn into a formula or a phone number could lose its leading zero.
 * A leading apostrophe keeps such values as plain text.
 */
export const asText = (value: string | undefined) =>
  value && /^([=+\-@]|0\d)/.test(value) ? `'${value}` : (value ?? '')

/** Up to this row, the overview lists courses before the totals row. */
const OVERVIEW_LAST_COURSE_ROW = 20

const bookingsSheet = (bookings: Booking[]): BookingSheet => ({
  tabName: 'bookings',
  data: [
    [
      'Buchungsnummer',
      'Nachname',
      'Vorname',
      'Adresse',
      'PLZ',
      'Ort',
      'Land',
      'E-Mail',
      'Telefon',
      'Gebühren',
      'Gebucht am',
      'Buchung-ID',
    ],
    ...bookings.map((booking) => [
      booking.orderNumber,
      asText(booking.lastName),
      asText(booking.firstName),
      asText(booking.address),
      asText(booking.zip),
      asText(booking.city),
      asText(booking.country),
      asText(booking.email),
      asText(booking.phone),
      booking.priceTotal,
      formatDateTime(booking._creationTime),
      booking._id,
    ]),
  ],
})

const attendeesSheet = (
  tabName: string,
  attendees: Attendee[],
  bookingsById: Map<string, Booking>,
): BookingSheet => ({
  tabName,
  data: [
    [
      'Buchungsnummer',
      'Nachname',
      'Vorname',
      'Alter',
      'Mitglied',
      'Kurse',
      'Gebucht am',
      'Buchung-ID',
      'Teilnehmer-ID',
      'Fotos erlaubt',
    ],
    ...attendees.map((attendee) => {
      const booking = bookingsById.get(attendee.bookingId)
      return [
        booking?.orderNumber,
        asText(attendee.lastName),
        asText(attendee.firstName),
        attendee.age,
        attendee.member,
        attendee.courses.join(', '),
        booking ? formatDateTime(booking._creationTime) : '',
        booking?._id,
        attendee._id,
        booking?.photoConsent ? 'ja' : 'nein',
      ]
    }),
  ],
})

const courseSheet = (
  courseSlug: string,
  attendees: Attendee[],
  bookingsById: Map<string, Booking>,
  updatedAt: string,
): BookingSheet => ({
  tabName: courseSlug,
  data: [
    [
      'Buchungsnummer',
      'Nachname',
      'Vorname',
      'Alter',
      'Mitglied',
      'Kurse',
      'Gebucht am',
      'Text Kurskarte',
      'Buchung-ID',
      'Teilnehmer-ID',
      'Fotos erlaubt',
    ],
    ...attendees.map((attendee) => {
      const booking = bookingsById.get(attendee.bookingId)
      return [
        `${booking?.orderNumber ?? ''}`,
        asText(attendee.lastName),
        asText(attendee.firstName),
        `${attendee.age}`,
        `${attendee.member}`,
        `${attendee.courses.join(', ')}`,
        booking ? formatDateTime(booking._creationTime) : '',
        booking
          ? asText(
              `${attendee.lastName} ${attendee.firstName} (${attendee.age}) ✆ ${booking.phone}`,
            )
          : '',
        booking?._id ?? '',
        attendee._id,
        booking?.photoConsent ? 'ja' : 'nein',
      ]
    }),
    [],
    [updatedAt],
  ],
})

const overviewSheet = (
  courseSlugs: string[],
  coursesBySlug: Map<string, CourseStory>,
  attendeesByCourse: Map<string, Attendee[]>,
  updatedAt: string,
): BookingSheet => {
  const data: SheetRow[] = [
    ['Kurs', 'Teilnehmerzahl', 'Plätze gesamt', 'Noch frei'],
    ...courseSlugs.map((slug) => {
      // Same seat limit rules as the booking flow, so both agree on free seats
      const seatLimit = parseSeatLimit(coursesBySlug.get(slug)?.content?.seatLimit)
      const totalAttendees = attendeesByCourse.get(slug)?.length ?? 0
      return [
        slug,
        totalAttendees,
        seatLimit ?? '?',
        seatLimit === undefined ? '' : seatLimit - totalAttendees,
      ]
    }),
  ]
  // Pad the course list so the totals row keeps its place
  const lastCourseRow = Math.max(data.length, OVERVIEW_LAST_COURSE_ROW)
  while (data.length < lastCourseRow) data.push(['', ''])
  data.push(['', ''])
  data.push([
    'Gesamt',
    `=SUMME(B2:B${lastCourseRow})`,
    `=SUMME(C2:C${lastCourseRow})`,
    `=SUMME(D2:D${lastCourseRow})`,
  ])
  data.push(['', ''])
  data.push([updatedAt])
  return { tabName: 'overview', data }
}

/**
 * All sheet tabs synced from the bookings, in the order they are written:
 * bookings, active attendees, cancelled attendees, one tab per course and
 * the overview with seats per course.
 */
export const buildBookingSheets = ({
  bookings,
  attendees: allAttendees,
  courses,
  now = new Date(),
}: {
  bookings: Booking[]
  attendees: Attendee[]
  courses: CourseStory[]
  now?: Date
}): BookingSheet[] => {
  const updatedAt = `Aktualisiert am ${formatDateTime(now)}`
  const bookingsById = new Map(bookings.map((booking) => [booking._id, booking]))
  const attendees = allAttendees.filter((attendee) => !attendee.cancelled)
  const cancelledAttendees = allAttendees.filter(
    (attendee) => attendee.cancelled,
  )

  const attendeesByCourse = new Map<string, Attendee[]>()
  for (const attendee of attendees) {
    for (const slug of attendee.courses) {
      attendeesByCourse.set(slug, [
        ...(attendeesByCourse.get(slug) ?? []),
        attendee,
      ])
    }
  }

  const coursesBySlug = new Map(courses.map((course) => [course.slug, course]))
  const courseSlugs = [...coursesBySlug.keys()].sort(sortCourses)

  return [
    bookingsSheet(bookings),
    attendeesSheet('attendees', attendees, bookingsById),
    attendeesSheet('cancellations', cancelledAttendees, bookingsById),
    ...courseSlugs.map((slug) =>
      courseSheet(
        slug,
        attendeesByCourse.get(slug) ?? [],
        bookingsById,
        updatedAt,
      ),
    ),
    overviewSheet(courseSlugs, coursesBySlug, attendeesByCourse, updatedAt),
  ]
}
