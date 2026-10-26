import {
  getAvailability,
  getFreeSeats,
  type Availability,
  type SeatsTaken,
} from '../booking/flow/availability'

/** A course as the schedule needs it, with dates as `YYYY-MM-DD`. */
export type ScheduleCourse = {
  slug: string
  categorySlug: string
  startDate: string
  endDate: string
  seatLimit?: unknown
  closed?: boolean
  canceled?: boolean
}

/** A weekend on which at least one course takes place. */
export type ScheduleColumn = {
  key: string
  startDate: string
  endDate: string
  label: string
}

export type ScheduleRow = {
  categorySlug: string
  title: string
  age?: string
  /** Rows of the same group share a heading row. */
  group?: string
  /** Shown across all columns while the row has no courses. */
  noCoursesMessage?: string
}

export const scheduleGroups: Record<string, { title: string; age: string }> = {
  kids: { title: 'Skikurse Kinder', age: '6–13 Jahre' },
}

export const scheduleRows: ScheduleRow[] = [
  { categorySlug: 'ski-bambini', title: 'Ski Bambini', age: '4–5 Jahre' },
  { categorySlug: 'ski-beginner', title: 'Beginner', group: 'kids' },
  {
    categorySlug: 'ski-junior-champion',
    title: 'Junior Champion',
    group: 'kids',
  },
  { categorySlug: 'ski-champion', title: 'Champion', group: 'kids' },
  {
    categorySlug: 'snowboard',
    title: 'Snowboard',
    age: '6–13 Jahre',
    noCoursesMessage: 'Termine folgen',
  },
]

const columnLabelFormat = new Intl.DateTimeFormat('de-DE', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})

const getColumnKey = (course: { startDate: string; endDate: string }) =>
  `${course.startDate}/${course.endDate}`

/** The weekends of all courses that have not ended before `today`. */
export const getScheduleColumns = (
  courses: ScheduleCourse[],
  today: string,
): ScheduleColumn[] => {
  const columns = new Map<string, ScheduleColumn>()
  for (const course of courses) {
    if (course.endDate < today) continue
    const key = getColumnKey(course)
    if (columns.has(key)) continue
    columns.set(key, {
      key,
      startDate: course.startDate,
      endDate: course.endDate,
      label: columnLabelFormat.formatRange(
        new Date(course.startDate),
        new Date(course.endDate),
      ),
    })
  }
  return [...columns.values()].sort((a, b) => a.key.localeCompare(b.key))
}

/** The state of a cell. `none` means no course of the row on that weekend. */
export type CellState = Availability | 'none'

/** When a row has several courses on a weekend, the most bookable one counts. */
const statePriority: CellState[] = [
  'open',
  'fewSeatsLeft',
  'fullyBooked',
  'closed',
  'canceled',
  'none',
]

export const getCellState = (
  courses: ScheduleCourse[],
  row: ScheduleRow,
  column: ScheduleColumn,
  seatsTaken: SeatsTaken | undefined,
): CellState =>
  courses
    .filter(
      (course) =>
        course.categorySlug === row.categorySlug &&
        getColumnKey(course) === column.key,
    )
    .map((course) =>
      getAvailability(course, getFreeSeats(course, seatsTaken)),
    )
    .reduce<CellState>(
      (best, state) =>
        statePriority.indexOf(state) < statePriority.indexOf(best)
          ? state
          : best,
      'none',
    )

/** Today as `YYYY-MM-DD`, in the time zone of the ski school. */
export const getToday = (now = new Date()) =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(now)
