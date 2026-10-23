// Rate limits the consent log (src/pages/einwilligung.ts) per IP.
// Netlify enforces `config.rateLimit` before the function runs, so the
// function only passes requests on.
export default async () => undefined

export const config = {
  path: '/einwilligung',
  method: 'POST',
  rateLimit: {
    windowLimit: 10,
    windowSize: 60,
    aggregateBy: ['ip', 'domain'],
  },
}
