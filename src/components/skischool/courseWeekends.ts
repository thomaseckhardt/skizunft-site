import {
  getScheduleColumns,
  scheduleGroups,
  scheduleRows,
  type ScheduleCourse,
} from './courseSchedule'

export type CourseWeekendCourse = Pick<
  ScheduleCourse,
  'slug' | 'categorySlug' | 'startDate' | 'endDate' | 'canceled'
> & {
  categoryName: string
}

/** A weekend of courses, shown among the upcoming events on the homepage. */
export type CourseWeekend = {
  key: string
  /** e.g. "2. Kurswochenende" */
  title: string
  /** The course offerings taking place, one per line. */
  description: string
  startDate: string
  endDate: string
}

const rowIndex = (categorySlug: string) => {
  const index = scheduleRows.findIndex(
    (row) => row.categorySlug === categorySlug,
  )
  return index === -1 ? scheduleRows.length : index
}

/** The full name of a course offering, e.g. "Ski Kinder Champion". */
const offeringName = (course: CourseWeekendCourse) => {
  const row = scheduleRows.find(
    (row) => row.categorySlug === course.categorySlug,
  )
  if (!row) return course.categoryName
  return row.group
    ? `${scheduleGroups[row.group].offeringPrefix} ${row.title}`
    : row.title
}

/**
 * The course weekends that have not ended before `today`. Weekends are numbered
 * across the whole catalog, so a weekend keeps its number once earlier ones are
 * over. A weekend whose courses are all canceled is left out but still counts.
 */
export const getCourseWeekends = (
  courses: CourseWeekendCourse[],
  today: string,
): CourseWeekend[] =>
  getScheduleColumns(courses, '')
    .map((column, index) => {
      const offerings = courses
        .filter(
          (course) =>
            !course.canceled &&
            course.startDate === column.startDate &&
            course.endDate === column.endDate,
        )
        .sort((a, b) => rowIndex(a.categorySlug) - rowIndex(b.categorySlug))
        .map(offeringName)
      return {
        key: column.key,
        title: `${index + 1}. Kurswochenende`,
        description: [...new Set(offerings)].join('\n'),
        startDate: column.startDate,
        endDate: column.endDate,
      }
    })
    .filter((weekend) => weekend.endDate >= today && weekend.description)
