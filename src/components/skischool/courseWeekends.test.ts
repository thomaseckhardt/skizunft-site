import { describe, expect, it } from 'vitest'
import { getCourseWeekends, type CourseWeekendCourse } from './courseWeekends'

const course = (
  slug: string,
  categorySlug: string,
  startDate: string,
  overrides: Partial<CourseWeekendCourse> = {},
): CourseWeekendCourse => {
  const end = new Date(startDate)
  end.setUTCDate(end.getUTCDate() + 1)
  return {
    slug,
    categorySlug,
    categoryName: categorySlug,
    startDate,
    endDate: end.toISOString().slice(0, 10),
    ...overrides,
  }
}

describe('getCourseWeekends', () => {
  it('numbers the weekends by date', () => {
    const weekends = getCourseWeekends(
      [
        course('beginner-2', 'ski-beginner', '2027-01-23'),
        course('bambini-1', 'ski-bambini', '2027-01-02'),
      ],
      '2026-10-26',
    )
    expect(
      weekends.map((weekend) => [weekend.title, weekend.startDate]),
    ).toEqual([
      ['1. Kurswochenende', '2027-01-02'],
      ['2. Kurswochenende', '2027-01-23'],
    ])
  })

  it('lists each course offering once, in the order of the schedule', () => {
    const [weekend] = getCourseWeekends(
      [
        course('snowboard-1', 'snowboard', '2027-01-02'),
        course('champion-1', 'ski-champion', '2027-01-02'),
        course('bambini-1a', 'ski-bambini', '2027-01-02'),
        course('bambini-1b', 'ski-bambini', '2027-01-02'),
      ],
      '2026-10-26',
    )
    expect(weekend.description).toBe(
      'Ski Bambini\nSki Kinder Champion\nSnowboard',
    )
  })

  it('falls back to the name of an offering missing from the schedule', () => {
    const [weekend] = getCourseWeekends(
      [
        course('adults-1', 'ski-adults', '2027-01-02', {
          categoryName: 'Ski Erwachsene',
        }),
        course('bambini-1', 'ski-bambini', '2027-01-02'),
      ],
      '2026-10-26',
    )
    expect(weekend.description).toBe('Ski Bambini\nSki Erwachsene')
  })

  it('keeps the numbers once earlier weekends are over', () => {
    const weekends = getCourseWeekends(
      [
        course('bambini-1', 'ski-bambini', '2027-01-02'),
        course('bambini-2', 'ski-bambini', '2027-01-23'),
      ],
      '2027-01-04',
    )
    expect(weekends.map((weekend) => weekend.title)).toEqual([
      '2. Kurswochenende',
    ])
  })

  it('keeps a weekend until its last day is over', () => {
    const weekends = getCourseWeekends(
      [course('bambini-1', 'ski-bambini', '2027-01-02')],
      '2027-01-03',
    )
    expect(weekends).toHaveLength(1)
  })

  it('leaves out canceled courses and weekends with only canceled courses', () => {
    const weekends = getCourseWeekends(
      [
        course('bambini-1', 'ski-bambini', '2027-01-02', { canceled: true }),
        course('bambini-2', 'ski-bambini', '2027-01-23'),
        course('beginner-2', 'ski-beginner', '2027-01-23', { canceled: true }),
      ],
      '2026-10-26',
    )
    expect(
      weekends.map((weekend) => [weekend.title, weekend.description]),
    ).toEqual([['2. Kurswochenende', 'Ski Bambini']])
  })
})
