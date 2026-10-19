/** Seats taken per course slug, by attendees who have not cancelled. */
export type SeatsTaken = Record<string, number>

export type Availability =
  | 'canceled'
  | 'closed'
  | 'fullyBooked'
  | 'fewSeatsLeft'
  | 'open'

type AvailabilityCourse = {
  slug: string
  seatLimit?: unknown
  closed?: boolean
  canceled?: boolean
  bookingStateMessage?: string
  bookingStateColor?: string
}

/** Up to this many free seats, a course shows that only few seats are left. */
const fewSeatsLeftLimit = 2

/** States that override the booking state maintained in Storyblok. */
const automaticStates: Partial<
  Record<Availability, { message: string; color: string }>
> = {
  closed: { message: 'ausgebucht', color: 'red' },
  fullyBooked: { message: 'ausgebucht', color: 'red' },
  fewSeatsLeft: { message: 'Nur noch wenige Plätze frei', color: 'blue' },
}

/** Storyblok stores the seat limit as a string; anything invalid means no limit. */
export const parseSeatLimit = (value: unknown) => {
  const seatLimit =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : NaN
  return Number.isInteger(seatLimit) && seatLimit >= 0 ? seatLimit : undefined
}

/** Seats the attendees of this booking take per course, leaving one attendee out. */
export const countBookingSeats = (
  attendees: { id: string; courses: string[] }[],
  exceptAttendeeId?: string,
) => {
  const seats: SeatsTaken = {}
  for (const attendee of attendees) {
    if (attendee.id === exceptAttendeeId) continue
    for (const slug of attendee.courses) seats[slug] = (seats[slug] ?? 0) + 1
  }
  return seats
}

/**
 * Free seats of a course, after the seats taken by other bookings and by
 * this booking. Undefined when the course has no seat limit or the seats
 * taken are still loading.
 */
export const getFreeSeats = (
  course: AvailabilityCourse,
  seatsTaken: SeatsTaken | undefined,
  bookingSeats: SeatsTaken = {},
) => {
  const seatLimit = parseSeatLimit(course.seatLimit)
  if (seatLimit === undefined || seatsTaken === undefined) return undefined
  return (
    seatLimit -
    (seatsTaken[course.slug] ?? 0) -
    (bookingSeats[course.slug] ?? 0)
  )
}

export const getAvailability = (
  course: AvailabilityCourse,
  freeSeats: number | undefined,
): Availability => {
  if (course.canceled) return 'canceled'
  if (course.closed) return 'closed'
  if (freeSeats === undefined) return 'open'
  if (freeSeats <= 0) return 'fullyBooked'
  if (freeSeats <= fewSeatsLeftLimit) return 'fewSeatsLeft'
  return 'open'
}

/** Decides whether a course can be booked and which booking state it shows. */
export const withAvailability = <T extends AvailabilityCourse>(
  course: T,
  freeSeats: number | undefined,
) => {
  const availability = getAvailability(course, freeSeats)
  const automaticState = automaticStates[availability]
  return {
    ...course,
    availability,
    disabled:
      availability === 'canceled' ||
      availability === 'closed' ||
      availability === 'fullyBooked',
    bookingStateMessage: automaticState?.message ?? course.bookingStateMessage,
    bookingStateColor: automaticState?.color ?? course.bookingStateColor,
  }
}

/**
 * Whether a course chosen in this booking can no longer be booked, e.g.
 * because other bookings took the last seats in the meantime.
 */
export const isNoLongerBookable = (
  course: AvailabilityCourse,
  seatsTaken: SeatsTaken | undefined,
  bookingSeats: SeatsTaken,
) => {
  if (course.canceled || course.closed) return true
  const freeSeats = getFreeSeats(course, seatsTaken, bookingSeats)
  return freeSeats !== undefined && freeSeats < 0
}
