import { consentCategories, type ConsentCategory } from '../../data/consent'

/**
 * Parses the body the cookie consent banner posts to the consent log.
 * Everything here comes from the browser, so nothing is trusted: unknown
 * fields and categories are dropped, and the rejected categories are derived
 * from the accepted ones instead of being taken from the request.
 */

export type ConsentAction = 'firstConsent' | 'change'

export type ConsentLog = {
  consentId: string
  action: ConsentAction
  revision: number
  consentTimestamp: string
  lastConsentTimestamp: string
  acceptedCategories: ConsentCategory[]
  rejectedCategories: ConsentCategory[]
}

export type ParseResult = { ok: true; log: ConsentLog } | { ok: false }

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isTimestamp = (value: unknown): value is string =>
  typeof value === 'string' &&
  ISO_TIMESTAMP_PATTERN.test(value) &&
  !Number.isNaN(Date.parse(value))

const isCategory = (value: unknown): value is ConsentCategory =>
  consentCategories.includes(value as ConsentCategory)

export function parseConsentLog(body: unknown): ParseResult {
  if (!isRecord(body)) return { ok: false }
  const {
    consentId,
    action,
    revision,
    consentTimestamp,
    lastConsentTimestamp,
    acceptedCategories,
  } = body

  if (typeof consentId !== 'string' || !UUID_PATTERN.test(consentId)) {
    return { ok: false }
  }
  if (action !== 'firstConsent' && action !== 'change') return { ok: false }
  if (!Number.isInteger(revision) || (revision as number) < 0) {
    return { ok: false }
  }
  if (!isTimestamp(consentTimestamp) || !isTimestamp(lastConsentTimestamp)) {
    return { ok: false }
  }
  if (!Array.isArray(acceptedCategories)) return { ok: false }

  const accepted = consentCategories.filter((category) =>
    acceptedCategories.some((value) => isCategory(value) && value === category),
  )

  return {
    ok: true,
    log: {
      consentId,
      action,
      revision: revision as number,
      consentTimestamp,
      lastConsentTimestamp,
      acceptedCategories: accepted,
      rejectedCategories: consentCategories.filter(
        (category) => !accepted.includes(category),
      ),
    },
  }
}
