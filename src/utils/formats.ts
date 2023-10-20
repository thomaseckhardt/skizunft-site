export const currencyFormat = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
})

export const formatPrice = (price) => {
  return currencyFormat.format(price)
}

export const getPrice = (attendee) => {
  return attendee.member ? getPriceMember(attendee) : getPriceNormal(attendee)
}

export const getPriceMember = (attendee) => {
  const price = this.getSelectedCategory(attendee)?.priceMember ?? 0
  const total = attendee.dates?.length * price
  return total
}

export const getPriceNormal = (attendee) => {
  const price = this.getSelectedCategory(attendee)?.price ?? 0
  const total = attendee.dates?.length * price
  return total
}
