import { describe, expect, it } from 'vitest'
import {
  getCellState,
  getScheduleColumns,
  getToday,
  scheduleRows,
  type ScheduleCourse,
} from './courseSchedule'

const course = (
  slug: string,
  categorySlug: string,
  startDate: string,
  overrides: Partial<ScheduleCourse> = {},
): ScheduleCourse => {
  const end = new Date(startDate)
  end.setUTCDate(end.getUTCDate() + 1)
  return {
    slug,
    categorySlug,
    startDate,
    endDate: end.toISOString().slice(0, 10),
    seatLimit: '8',
    ...overrides,
  }
}

const bambini = scheduleRows.find((row) => row.categorySlug === 'ski-bambini')!

describe('getScheduleColumns', () => {
  it('has one column per weekend, sorted by date', () => {
    const columns = getScheduleColumns(
      [
        course('beginner-2', 'ski-beginner', '2027-01-23'),
        course('bambini-1', 'ski-bambini', '2027-01-02'),
        course('beginner-1', 'ski-beginner', '2027-01-02'),
      ],
      '2026-10-26',
    )
    expect(columns.map((column) => column.label)).toEqual([
      '2.–3. Jan.',
      '23.–24. Jan.',
    ])
  })

  it('leaves out weekends that are over', () => {
    const columns = getScheduleColumns(
      [
        course('bambini-1', 'ski-bambini', '2027-01-02'),
        course('bambini-2', 'ski-bambini', '2027-01-23'),
      ],
      '2027-01-04',
    )
    expect(columns.map((column) => column.startDate)).toEqual(['2027-01-23'])
  })

  it('keeps a weekend until its last day is over', () => {
    const columns = getScheduleColumns(
      [course('bambini-1', 'ski-bambini', '2027-01-02')],
      '2027-01-03',
    )
    expect(columns).toHaveLength(1)
  })
})

describe('getCellState', () => {
  const courses = [
    course('bambini-1', 'ski-bambini', '2027-01-02'),
    course('bambini-2', 'ski-bambini', '2027-01-23', { canceled: true }),
    course('beginner-3', 'ski-beginner', '2027-01-30'),
  ]
  const columns = getScheduleColumns(courses, '2026-10-26')

  it('is none without a course of the row on that weekend', () => {
    expect(getCellState(courses, bambini, columns[2], {})).toBe('none')
  })

  it('is open while the seats taken are unknown', () => {
    expect(getCellState(courses, bambini, columns[0], undefined)).toBe('open')
  })

  it('shows few seats left and fully booked courses', () => {
    expect(getCellState(courses, bambini, columns[0], { 'bambini-1': 6 })).toBe(
      'fewSeatsLeft',
    )
    expect(getCellState(courses, bambini, columns[0], { 'bambini-1': 8 })).toBe(
      'fullyBooked',
    )
  })

  it('shows canceled courses', () => {
    expect(getCellState(courses, bambini, columns[1], {})).toBe('canceled')
  })

  it('takes the most bookable of several courses on a weekend', () => {
    const groups = [
      course('bambini-1a', 'ski-bambini', '2027-01-02'),
      course('bambini-1b', 'ski-bambini', '2027-01-02'),
    ]
    const [column] = getScheduleColumns(groups, '2026-10-26')
    expect(
      getCellState(groups, bambini, column, { 'bambini-1a': 8, 'bambini-1b': 7 }),
    ).toBe('fewSeatsLeft')
  })
})

describe('getToday', () => {
  it('uses the time zone of the ski school', () => {
    expect(getToday(new Date('2027-01-02T23:30:00Z'))).toBe('2027-01-03')
  })
})
