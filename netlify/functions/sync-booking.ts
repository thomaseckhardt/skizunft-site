import { fetchStoriesSSR } from '@/storyblok/utils/fetchStoriesSSR'
import { api } from '@db/api'
import type { Config } from '@netlify/functions'
import { ConvexHttpClient } from 'convex/browser'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
]

// ----------------------------------------------------------------------------
// GOOGLE SHEET
// ----------------------------------------------------------------------------

// Get Sheet ID from environment variable
const getSheetId = () => {
  const sheetId = Netlify.env.get('GOOGLE_SHEET_ID')
  if (!sheetId) {
    throw new Error('GOOGLE_SHEET_ID environment variable is not set')
  }
  return sheetId
}

// Initialize Google Spreadsheet with JWT authentication
const getGoogleSpreadsheet = async () => {
  const sheetId = getSheetId()

  // Get service account credentials from environment or file
  const serviceAccountEmail = Netlify.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL')
  let privateKey = Netlify.env.get('GOOGLE_PRIVATE_KEY')

  if (!serviceAccountEmail || !privateKey) {
    throw new Error(
      'GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY environment variables are required',
    )
  }

  // Handle different newline encodings
  // In Netlify, the private key might be stored with literal \n characters
  // Replace them with actual newlines
  privateKey = privateKey.replace(/\\n/g, '\n')

  const serviceAccountAuth = new JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: SCOPES,
  })

  const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth)
  await doc.loadInfo()

  return doc
}

// Save data to a specific sheet tab
const saveGoogleSheet = async ({ tabName, data, range = 'A1:Z500' }) => {
  const doc = await getGoogleSpreadsheet()

  // Get or create the sheet
  let sheet = doc.sheetsByTitle[tabName]
  if (!sheet) {
    sheet = await doc.addSheet({ title: tabName })
  }

  // Clear existing content
  await sheet.clear()

  // Update with new data using setHeaderRow and addRows
  if (data.length > 0) {
    await sheet.setHeaderRow(data[0])
    if (data.length > 1) {
      await sheet.addRows(data.slice(1))
    }
  }

  console.log(`Successfully updated sheet: ${tabName}`)
}

// ----------------------------------------------------------------------------

export default async () => {
  try {
    console.log('Establish db connection')
    const httpClient = new ConvexHttpClient(
      Netlify.env.get('PUBLIC_CONVEX_URL'),
    )

    console.log('Query bookings')
    const bookings = await httpClient.query(api.bookings.list)
    console.log(`${bookings?.length || 0} bookings found`)

    const courseStories = await fetchStoriesSSR({
      content_type: 'Course',
      per_page: 50,
      sort_by: 'content.startDate:asc',
    })

    const coursesBySlug = courseStories.reduce((acc, course) => {
      acc[course.slug] = course
      return acc
    }, {})

    // {
    //   _creationTime: 1699815755564.7134,
    //   _id: '3wqdnxjtnvsf4bc6r4p20jy59kczwq8',
    //   address: 'Glasig  10',
    //   city: 'Freiamt',
    //   country: '',
    //   email: 'tanja-grafmueller@web.de',
    //   firstName: 'Tanja',
    //   lastName: 'Grafmüller',
    //   legalConfirmed: true,
    //   newsletterConfirmed: false,
    //   orderNumber: '781680',
    //   phone: '01708140856',
    //   priceTotal: 118,
    //   privacyConfirmed: true,
    //   returningCustomer: false,
    //   zip: '79348'
    // }

    console.log('Save bookings to google sheet')
    await saveGoogleSheet({
      tabName: 'bookings',
      data: [
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
        ...bookings.map((booking) => [
          booking.orderNumber,
          booking.lastName,
          booking.firstName,
          booking.address,
          booking.zip,
          booking.city,
          booking.country,
          booking.email,
          booking.phone,
          booking.priceTotal,
          new Date(booking._creationTime).toLocaleString('de-DE', {
            timeZone: 'Europe/Berlin',
          }),
          booking._id,
        ]),
      ],
    })

    console.log('Query attendees')
    const attendees = await httpClient.query(api.attendees.list)
    console.log(`${attendees?.length || 0} attendees found`)

    // _creationTime: 1697840293766.5488,
    // _id: '3shjg6vek6d3k68kyj7xqvkn9k11jm8',
    // age: 6,
    // bookingId: '3zsbs8rna4qyjeg2ftnr5xwn9k16y9g',
    // courses: [
    //   'ski-junior-champion-1',
    //   'ski-junior-champion-2',
    //   'ski-junior-champion-3'
    // ],
    // firstName: 'Marie',
    // lastName: 'Müller',
    // member: false,
    // priceTotal: 177

    console.log('Save attendees to google sheet')
    await saveGoogleSheet({
      tabName: 'attendees',
      data: [
        [
          'Buchungsnummer',
          'Nachname',
          'Vorname',
          'Alter',
          'Mitglied',
          'Kurse',
          'Gebucht am',
          'Buchung-ID',
          'Teilnehmer-ID',
        ],
        ...attendees.map((attendee) => {
          const booking = bookings.find(
            (booking) => booking._id === attendee.bookingId,
          )
          return [
            booking?.orderNumber,
            attendee.lastName,
            attendee.firstName,
            attendee.age,
            attendee.member,
            attendee.courses.join(', '),
            new Date(booking?._creationTime).toLocaleString('de-DE', {
              timeZone: 'Europe/Berlin',
            }),
            booking?._id,
            attendee._id,
          ]
        }),
      ],
    })

    const attendeesByCourse = attendees.reduce(
      (acc, attendee) => {
        attendee.courses.forEach((course) => {
          if (!acc[course]) {
            acc[course] = []
          }
          acc[course].push(attendee)
        })
        return acc
      },
      {} as Record<string, typeof attendees>,
    )

    console.log('Save course sheets to google sheet')
    for (const [course, courseAttendees] of Object.entries(attendeesByCourse)) {
      await saveGoogleSheet({
        tabName: course,
        data: [
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
          ],
          ...courseAttendees.map((attendee) => {
            const booking = bookings.find(
              (booking) => booking._id === attendee.bookingId,
            )
            return [
              `${booking?.orderNumber}`,
              `${attendee.lastName}`,
              `${attendee.firstName}`,
              `${attendee.age}`,
              `${attendee.member}`,
              `${attendee.courses.join(', ')}`,
              new Date(booking?._creationTime).toLocaleString('de-DE', {
                timeZone: 'Europe/Berlin',
              }),
              `${attendee.lastName} ${attendee.firstName} (${attendee.age}) ✆ ${booking.phone}`,
              booking?._id,
              attendee._id,
            ]
          }),
        ],
      })
    }

    const StatOrder = [
      'ski-bambini',
      'ski-beginner',
      'ski-junior-champion',
      'ski-champion',
      'ski-erwachsene',
      'snowboard',
    ]
    const getStatOrder = (course) =>
      StatOrder.findIndex((order) => course.startsWith(order))
    const stats = Object.entries(attendeesByCourse)
      .map(([course, courseAttendees]) => {
        const courseStory = coursesBySlug[course]
        const seatLimit = courseStory?.content?.seatLimit || '?'
        const totalAttendees = courseAttendees.length
        console.log('course', course)
        return {
          course,
          totalAttendees,
          seatLimit,
          availableSeats: seatLimit - totalAttendees,
        }
      })
      .sort((a, b) => a.course.localeCompare(b.course))
      .sort((a, b) => getStatOrder(a.course) - getStatOrder(b.course))

    const statsData = [
      ['Kurs', 'Teilnehmerzahl', 'Plätze gesamt', 'Noch frei'],
      ...stats.map((stat) => {
        return [
          stat.course,
          stat.totalAttendees,
          stat.seatLimit,
          stat.availableSeats,
        ]
      }),
    ]
    // Fill statsData array with empty strings to have a fixed length
    const statsDataLength = statsData.length
    for (let i = 0; i < 20 - statsDataLength; i++) {
      statsData.push(['', ''])
    }
    statsData.push(['', ''])
    statsData.push([
      `Gesamt`,
      `=SUMME(B2:B20)`,
      `=SUMME(C2:C20)`,
      `=SUMME(D2:D20)`,
    ])
    statsData.push(['', ''])
    statsData.push([
      `Aktualisiert am ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}`,
    ])

    console.log('Save stats to google sheet')
    await saveGoogleSheet({
      tabName: 'overview',
      data: statsData,
    })

    console.log('Sync completed successfully!')
  } catch (error) {
    console.log('error', error)
  }
}

export const config: Config = {
  // schedule: '@hourly',
  schedule: '*/15 * * * *',
}
