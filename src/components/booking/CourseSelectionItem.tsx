import clsx from 'clsx'
import Icon from '@/components/Icon'

const BookingStateColors = {
  grey: 'text-gray-500',
  green: 'text-green-600',
  red: 'text-rose-700',
  yellow: 'text-yellow-700',
  blue: 'text-sky-600',
}

export default function CourseSelection({ course, inputProps }) {
  const bookingStateColor =
    BookingStateColors[course.bookingStateColor] ?? BookingStateColors.grey

  // Courses of the booking flow carry their availability, which also decides
  // the booking state, see flow/availability.ts.
  const hasAvailability = course.availability !== undefined
  const isUnavailable = hasAvailability
    ? course.availability === 'closed' || course.availability === 'fullyBooked'
    : course.closed

  const bookingStateMessage = isUnavailable
    ? 'ausgebucht'
    : course.bookingStateMessage

  return (
    <label
      className={clsx(
        'relative flex rounded-lg bg-white p-4 text-base shadow-sm focus:outline-none md:items-center',
        course.disabled ? 'cursor-not-allowed' : 'cursor-pointer',
      )}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        value={course.slug}
        {...inputProps}
        disabled={course.disabled}
      />
      <div className="relative z-10 flex flex-1 items-center text-gray-900 peer-disabled:text-gray-500 peer-disabled:ring-gray-200">
        <div>
          <div className="font-medium">{course.name}</div>
          <div>{course.dateFormatted}</div>
        </div>
      </div>
      {!course.disabled && (
        <Icon
          name="checkmark-circle-20-filled"
          className="invisible relative z-10 ml-2 text-sky-600 peer-checked:visible peer-disabled:hidden"
          size={20}
        />
      )}
      {bookingStateMessage && (
        <span
          className={clsx(
            'relative z-10 ml-5 pl-6 text-right text-sm',
            !hasAvailability &&
              'peer-disabled:text-gray-500 peer-disabled:ring-gray-200',
            'peer-checked:hidden',
            bookingStateColor,
          )}
        >
          {bookingStateMessage}
        </span>
      )}
      {!course.disabled && !isUnavailable && bookingStateMessage && (
        <Icon
          name="calendar-info-20-regular"
          className={clsx(
            'relative z-10 ml-2 peer-checked:hidden',
            bookingStateColor,
          )}
          size={20}
        />
      )}
      {isUnavailable && (
        <Icon
          name="warning-20-regular"
          className={clsx(
            'relative z-10 ml-2 hidden peer-disabled:block',
            hasAvailability ? bookingStateColor : 'text-gray-500',
          )}
          size={20}
        />
      )}
      <div
        className={clsx(
          'pointer-events-none absolute -inset-px rounded-lg ring-1 ring-inset ring-gray-300 peer-checked:ring-2 peer-checked:ring-sky-600',
          'peer-disabled:bg-gray-50',
        )}
        aria-hidden="true"
      ></div>
    </label>
  )
}
