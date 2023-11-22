import clsx from 'clsx'
import Icon from '@/components/Icon'
import CourseSelectionItem from './CourseSelectionItem'

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
        <CourseSelectionItem
          key={course.id}
          course={course}
          register={register}
          name={name}
        />
      ))}
    </div>
  )
}
