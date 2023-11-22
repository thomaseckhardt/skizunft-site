import clsx from 'clsx'
import Icon from '@/components/Icon'

const BookingStateColors = {
  grey: 'text-gray-500',
  green: 'text-green-600',
  red: 'text-rose-700',
  yellow: 'text-yellow-700',
  blue: 'text-sky-600',
}

export default function CourseSelection({ course, register, name }) {
  const bookingStateColor =
    BookingStateColors[course.bookingStateColor] ?? BookingStateColors.grey

  const bookingStateMessage = course.closed
    ? 'ausgebucht'
    : course.bookingStateMessage

  return (
    <label
      className={clsx(
        'relative flex rounded-lg bg-white p-4 text-sm shadow-sm focus:outline-none md:items-center',
        course.disabled ? 'cursor-not-allowed' : 'cursor-pointer',
      )}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        value={course.slug}
        {...register(name)}
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
            'peer-disabled:text-gray-500 peer-disabled:ring-gray-200',
            'peer-checked:hidden',
            bookingStateColor,
          )}
        >
          {bookingStateMessage}
        </span>
      )}
      {!course.disabled && !course.closed && bookingStateMessage && (
        <Icon
          name="calendar-info-20-regular"
          className={clsx(
            'relative z-10 ml-2 peer-checked:hidden',
            bookingStateColor,
          )}
          size={20}
        />
      )}
      {course.closed && (
        <Icon
          name="warning-20-regular"
          className="relative z-10 ml-2 hidden text-gray-500 peer-disabled:block"
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
