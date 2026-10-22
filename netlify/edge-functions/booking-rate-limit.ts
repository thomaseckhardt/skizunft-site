// Rate limits the booking submission (src/pages/buchung/absenden.ts) per IP.
// Netlify enforces `config.rateLimit` before the function runs, so the
// function only passes requests on.
export default async () => undefined

export const config = {
  path: '/buchung/absenden',
  method: 'POST',
  rateLimit: {
    windowLimit: 5,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
}
