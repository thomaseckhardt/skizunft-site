import { describe, expect, it, vi } from 'vitest'
import { createPricing, formatPercent, resolveDiscountCode } from './pricing'

vi.mock('./discountCodes', () => ({
  discountCodes: { brettlemarkt2026: { rate: 0.1, label: 'Brettlemarkt' } },
}))

describe('resolveDiscountCode', () => {
  it('is none without a code', () => {
    expect(resolveDiscountCode(undefined)).toEqual({ status: 'none' })
    expect(resolveDiscountCode(null)).toEqual({ status: 'none' })
    expect(resolveDiscountCode('  ')).toEqual({ status: 'none' })
  })

  it('is active for a known code, ignoring case', () => {
    expect(resolveDiscountCode('Brettlemarkt2026')).toEqual({
      status: 'active',
      code: 'Brettlemarkt2026',
      rate: 0.1,
      label: 'Brettlemarkt',
    })
  })

  it('is invalid for an unknown or expired code', () => {
    expect(resolveDiscountCode('brettlemarkt2025')).toEqual({
      status: 'invalid',
      code: 'brettlemarkt2025',
    })
  })
})

describe('createPricing', () => {
  const catalog = {
    courseCategories: [{ id: 'beginner', price: 95, priceMember: 80 }],
    courses: [{ slug: 'open', categoryId: 'beginner' }],
  }
  const attendees = [{ member: false, courses: ['open'] }]

  it('applies an active discount', () => {
    const pricing = createPricing({
      ...catalog,
      discount: resolveDiscountCode('brettlemarkt2026'),
    })
    expect(pricing.getDiscountedPrice(95)).toBeCloseTo(85.5)
    expect(pricing.getTotalPrice(attendees)).toBeCloseTo(85.5)
  })

  it('charges the regular price for an invalid code', () => {
    const pricing = createPricing({
      ...catalog,
      discount: resolveDiscountCode('free'),
    })
    expect(pricing.discountRate).toBe(0)
    expect(pricing.getDiscountedPrice(95)).toBe(95)
    expect(pricing.getTotalPrice(attendees)).toBe(95)
  })
})

describe('formatPercent', () => {
  it('rounds and keeps the sign on the same line', () => {
    expect(formatPercent(0.1)).toBe('10 %')
  })
})
