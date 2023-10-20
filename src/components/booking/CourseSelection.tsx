import clsx from 'clsx'
import Icon from '@/components/Icon'

export default function CourseSelection({
  courses = [],
  register,
  errors,
  name,
  ...props
}) {
  return (
    <div className="mt-4 space-y-2" {...props}>
      {/* <!-- Active: "border-sky-600 ring-2 ring-sky-600", Not Active: "border-gray-300" --> */}
      {courses.map((course) => (
        // <!-- <pre className="absolute" x-text="JSON.stringify(course.catgeory.priceFormatted, null, 2)"></pre> -->
        <label
          key={course.id}
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
          {course.state && (
            <span
              className={clsx(
                'relative z-10 ml-5 pl-6 text-right text-sm',
                'peer-disabled:text-gray-500 peer-disabled:ring-gray-200',
                'peer-checked:hidden',
                course.stateColor ? course.stateColor : 'text-gray-500',
              )}
            >
              {course.state}
            </span>
          )}
          {!course.disabled && course.state && (
            <Icon
              name="calendar-info-20-regular"
              className="relative z-10 ml-2 text-gray-500 peer-checked:hidden"
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
      ))}
    </div>
  )
}
