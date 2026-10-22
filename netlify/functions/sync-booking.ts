import { fetchStoriesSSR } from '@/storyblok/utils/fetchStoriesSSR'
import { api } from '@db/api'
import type { Config } from '@netlify/functions'
import { ConvexHttpClient } from 'convex/browser'
import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import { buildBookingSheets } from '@/utils/bookingSheets'
import { saveSheet, sleep } from '@/utils/googleSheets'

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

// ----------------------------------------------------------------------------

export default async () => {
  try {
    console.log('Establish db connection')
    // PUBLIC_CONVEX_URL only exists at build time (set by `convex deploy`), so
    // functions read the deployment URL from a runtime variable.
    const convexUrl = Netlify.env.get('CONVEX_URL')
    if (!convexUrl) {
      throw new Error('CONVEX_URL environment variable is not set')
    }
    const httpClient = new ConvexHttpClient(convexUrl)

    // Initialize Google Spreadsheet once and reuse
    const doc = await getGoogleSpreadsheet()

    console.log('Query bookings')
    const bookings = await httpClient.query(api.bookings.list)
    console.log(`${bookings.length} bookings found`)

    console.log('Query attendees')
    const attendees = await httpClient.query(api.attendees.list)
    console.log(`${attendees.length} attendees found`)

    const courses = await fetchStoriesSSR({
      content_type: 'Course',
      per_page: 100,
      sort_by: 'content.startDate:asc',
    })
    // fetchStoriesSSR returns the error instead of throwing
    if (!Array.isArray(courses)) {
      throw new Error('Could not load courses from Storyblok', {
        cause: courses,
      })
    }

    const sheets = buildBookingSheets({ bookings, attendees, courses })
    for (const sheet of sheets) {
      await saveSheet(doc, sheet)
      // Tiny pacing between sheets to reduce burst writes
      await sleep(150)
    }

    console.log('Sync completed successfully!')
  } catch (error) {
    console.log('error', error)
  }
}

export const config: Config = {
  // schedule: '@hourly',
  schedule: '*/20 * * * *',
}
