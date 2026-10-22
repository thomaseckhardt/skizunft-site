import QRCode from 'qrcode'
import { buildEpcPayload, isValidAmount } from '@/utils/payment'

/**
 * Returns a GiroCode (EPC QR code) as PNG for a transfer to the club's
 * account. The account is fixed here, so the code can't be pointed at
 * another IBAN. Usage: /api/girocode?amount=118.00&ref=178312%20Julia%20M%C3%BCller
 */
export default async function (req: Request) {
  const params = new URL(req.url).searchParams
  const amount = Number(params.get('amount'))
  const reference = params.get('ref') ?? ''

  if (!isValidAmount(amount)) {
    return new Response('Invalid amount', { status: 400 })
  }

  let payload: string
  try {
    payload = buildEpcPayload({ amount, reference })
  } catch (error) {
    return new Response('Invalid reference', { status: 400 })
  }

  const png = await QRCode.toBuffer([{ data: payload, mode: 'byte' }], {
    type: 'png',
    errorCorrectionLevel: 'M',
    width: 300,
    margin: 4,
  })

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      // The image depends on the query string only
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
