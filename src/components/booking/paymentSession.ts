/**
 * Hands the payment details of a just submitted booking to the success
 * page. Kept in sessionStorage so no personal data ends up in the URL.
 */
export type PaymentSession = {
  amount: number
  reference: string
  firstCourseStart?: string
}

const STORAGE_KEY = 'booking-payment'

export function savePaymentSession(payment: PaymentSession) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payment))
  } catch {
    // The success page then shows its generic text only
  }
}

export function loadPaymentSession(): PaymentSession | null {
  try {
    const payment = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null')
    return typeof payment?.amount === 'number' &&
      typeof payment?.reference === 'string'
      ? payment
      : null
  } catch {
    return null
  }
}
