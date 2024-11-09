import { ConvexHttpClient } from 'convex/browser'
import { api } from '@db/api'
import { google } from 'googleapis'

// ----------------------------------------------------------------------------
// GOOGLE SHEET
// ----------------------------------------------------------------------------

const serviceAccountKeyFile = `google-api-credentials.json`
const sheetId = `1y_-G-GcrR_70YL3B1pOFRFiVKdNKEPHNZ5KVmRaKLlk`

const getGoogleClient = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: serviceAccountKeyFile,
    scopes: [`https://www.googleapis.com/auth/spreadsheets`],
  })
  const authClient = await auth.getClient()
  return google.sheets({
    version: 'v4',
    auth: authClient,
  })
}

const writeGoogleSheet = async (
  googleClient,
  sheetId,
  tabName,
  range,
  data,
) => {
  await googleClient.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${tabName}!${range}`,
    valueInputOption: 'USER_ENTERED',
    // insertDataOption: "INSERT_ROWS",
    resource: {
      majorDimension: 'ROWS',
      values: data,
    },
  })
}

const saveGoogleSheet = async ({ tabName, data, range = 'A1:Z500' }) => {
  // Generating google sheet client
  const googleClient = await getGoogleClient()

  await writeGoogleSheet(googleClient, sheetId, tabName, range, data)

  // TODO: update sytling
  // https://developers.google.com/sheets/api/samples/formatting
  // TODO: update formulas
}

// ----------------------------------------------------------------------------

export default async (event) => {
  if (event.body === null) {
    return new Response('Payload required', {
      status: 400,
      statusText: 'Payload required',
    })
  }

  try {
    console.log('Establish db connection')
    const httpClient = new ConvexHttpClient(process.env.PUBLIC_CONVEX_URL)

    console.log('Query bookings')
    const bookings = await httpClient.query(api.bookings.list)
    console.log(`${bookings?.length || 0} bookings found`)

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

    const attendeesByCourse = attendees.reduce((acc, attendee) => {
      attendee.courses.forEach((course) => {
        if (!acc[course]) {
          acc[course] = []
        }
        acc[course].push(attendee)
      })
      return acc
    }, {})
    Object.entries(attendeesByCourse).forEach(([course, attendees]) => {
      saveGoogleSheet({
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
              `${attendee.lastName} ${attendee.firstName} (${attendee.age}) ✆ ${booking.phone}`,
              booking?._id,
              attendee._id,
            ]
          }),
        ],
      })
    })

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
      .map(([course, attendees]) => {
        return {
          course,
          totalAttendees: attendees.length,
        }
      })
      .sort((a, b) => a.course.localeCompare(b.course))
      .sort((a, b) => getStatOrder(a.course) - getStatOrder(b.course))

    const statsData = [
      ['Kurs', 'Teilnehmerzahl'],
      ...stats.map((stat) => {
        return [stat.course, stat.totalAttendees]
      }),
    ]
    // Fill statsData array with empty strings to have a fixed length
    const statsDataLength = statsData.length
    for (let i = 0; i < 20 - statsDataLength; i++) {
      statsData.push(['', ''])
    }
    statsData.push(['', ''])
    statsData.push([`Gesamt`, `=SUMME(B2:B20)`])
    statsData.push(['', ''])
    statsData.push([
      `Aktualisiert am ${new Date().toLocaleString('de-DE', {
        timeZone: 'Europe/Berlin',
      })}`,
    ])

    saveGoogleSheet({
      tabName: 'overview',
      data: statsData,
      // data: [
      //   ['Kurs', 'Teilnehmerzahl'],
      //   ...stats.map((stat) => {
      //     return [stat.course, stat.totalAttendees]
      //   }),
      //   [],
      //   [
      //     `Aktualisiert am ${new Date().toLocaleString('de-DE', {
      //       timeZone: 'Europe/Berlin',
      //     })}`,
      //   ],
      // ],
    })
    console.log('Save stats to google sheet')
  } catch (error) {
    console.log('error', error)
  }
}

export const config = {
  schedule: '@hourly',
}
