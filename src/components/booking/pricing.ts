import { discountCodes } from './discountCodes'

export type Discount =
  | { status: 'none' }
  | { status: 'invalid'; code: string }
  | { status: 'active'; code: string; rate: number; label: string }

export const resolveDiscountCode = (
  discountCode: string | null | undefined,
): Discount => {
  const code = discountCode?.trim()
  if (!code) return { status: 'none' }
  const config = discountCodes[code.toLowerCase()]
  return config
    ? { status: 'active', code, ...config }
    : { status: 'invalid', code }
}

export const getDiscountRate = (discount: Discount) =>
  discount.status === 'active' ? discount.rate : 0

// The non-breaking space keeps number and sign on one line.
export const formatPercent = (rate: number) =>
  `${Math.round(rate * 100)}\u00a0%`

export const createPricing = ({
  courses,
  courseCategories,
  discount = { status: 'none' },
}: {
  courses: any[]
  courseCategories: any[]
  discount?: Discount
}) => {
  const discountRate = getDiscountRate(discount)

  const getAttendeeTotalPrice = (attendee) => {
    if (!Array.isArray(attendee?.courses)) return 0

    return attendee.courses.reduce((total, courseSlug) => {
      const course = courses.find((course) => courseSlug === course.slug)
      const category = courseCategories.find(
        (category) => course?.categoryId === category.id,
      ) ?? {
        price: 0,
        priceMember: 0,
      }
      const coursePrice = attendee.member
        ? category.priceMember
        : category.price
      return total + coursePrice
    }, 0)
  }

  const getSubtotal = (attendees) =>
    attendees.reduce(
      (total, attendee) => total + getAttendeeTotalPrice(attendee),
      0,
    )

  const getDiscount = (attendees) => getSubtotal(attendees) * discountRate

  const getTotalPrice = (attendees) =>
    getSubtotal(attendees) * (1 - discountRate)

  /** A single price with the discount applied */
  const getDiscountedPrice = (price: number) => price * (1 - discountRate)

  return {
    discount,
    discountRate,
    getAttendeeTotalPrice,
    getSubtotal,
    getDiscount,
    getTotalPrice,
    getDiscountedPrice,
  }
}

export type Pricing = ReturnType<typeof createPricing>
