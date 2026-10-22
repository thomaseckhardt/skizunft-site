const discountCodes: Record<string, number> = {
  brettlemarkt2026: 0.1,
}

export const getDiscountRate = (discountCode: string | null) =>
  (discountCode && discountCodes[discountCode]) || 0

export const createPricing = ({ courses, courseCategories, discountRate }) => {
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

  return {
    discountRate,
    getAttendeeTotalPrice,
    getSubtotal,
    getDiscount,
    getTotalPrice,
  }
}

export type Pricing = ReturnType<typeof createPricing>
