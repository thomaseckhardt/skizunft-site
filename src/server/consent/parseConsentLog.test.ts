import { describe, expect, it } from 'vitest'
import { parseConsentLog } from './parseConsentLog'

const valid = {
  consentId: '3f2b8c1e-9a4d-4e6f-8b2a-1c3d5e7f9a0b',
  action: 'firstConsent',
  revision: 1,
  consentTimestamp: '2026-10-23T09:15:00.000Z',
  lastConsentTimestamp: '2026-10-23T09:15:00.000Z',
  acceptedCategories: ['necessary', 'maps'],
}

describe('parseConsentLog', () => {
  it('accepts a complete consent', () => {
    expect(parseConsentLog(valid)).toEqual({
      ok: true,
      log: { ...valid, rejectedCategories: [] },
    })
  })

  it('derives the rejected categories from the accepted ones', () => {
    const result = parseConsentLog({
      ...valid,
      acceptedCategories: ['necessary'],
      rejectedCategories: [],
    })
    expect(result.ok && result.log.rejectedCategories).toEqual(['maps'])
  })

  it('drops unknown and duplicate categories', () => {
    const result = parseConsentLog({
      ...valid,
      acceptedCategories: ['maps', 'analytics', 'maps', 42],
    })
    expect(result.ok && result.log.acceptedCategories).toEqual(['maps'])
  })

  it('drops unknown fields', () => {
    const result = parseConsentLog({ ...valid, ip: '127.0.0.1' })
    expect(result.ok && 'ip' in result.log).toBe(false)
  })

  it.each([
    ['a body that is no object', null],
    ['a consent id that is no UUID', { ...valid, consentId: 'abc' }],
    ['an unknown action', { ...valid, action: 'delete' }],
    ['a negative revision', { ...valid, revision: -1 }],
    ['a fractional revision', { ...valid, revision: 1.5 }],
    ['a timestamp that is no ISO date', { ...valid, consentTimestamp: 'today' }],
    ['categories that are no array', { ...valid, acceptedCategories: 'maps' }],
  ])('rejects %s', (_, body) => {
    expect(parseConsentLog(body)).toEqual({ ok: false })
  })
})
