/**
 * Renders the booking confirmation mail with the fixture payload and writes
 * it to email-preview.html in the project root. The GiroCode is inlined, so
 * the preview works without a running Netlify dev server.
 *
 * Usage: pnpm email:preview
 */
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import QRCode from 'qrcode'
import {
  getPaymentDetails,
  renderBookingConfirmation,
} from '../../src/emails/renderBookingConfirmation'
import { buildEpcPayload } from '../../src/utils/payment'
import payload from './booking-confirmation.json'

const origin = 'http://localhost:8888'
const { reference } = getPaymentDetails(payload, { origin })
const giroCodeSrc = await QRCode.toDataURL(
  [
    {
      data: buildEpcPayload({ amount: payload.amount, reference }),
      mode: 'byte',
    },
  ],
  { errorCorrectionLevel: 'M', width: 300, margin: 4 },
)

const outFile = resolve('email-preview.html')
writeFileSync(
  outFile,
  renderBookingConfirmation(payload, { origin, giroCodeSrc }),
)
console.log(`Preview written to ${outFile}`)
