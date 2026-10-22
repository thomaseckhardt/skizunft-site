/**
 * Renders the booking confirmation mail with the fixture payload and writes
 * it to email-preview.html in the project root.
 *
 * Usage: pnpm email:preview
 */
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { renderBookingConfirmation } from '../../src/emails/renderBookingConfirmation'
import payload from './booking-confirmation.json'

const outFile = resolve('email-preview.html')
writeFileSync(outFile, renderBookingConfirmation(payload))
console.log(`Preview written to ${outFile}`)
