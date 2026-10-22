/**
 * Bank account that receives the course fees.
 *
 * `accountHolder` must match the name the bank has on file for this IBAN:
 * banking apps compare both (Verification of Payee) and warn the payer on a
 * mismatch. It differs from the club's registered name on purpose.
 */
export const BANK_ACCOUNT = {
  accountHolder: 'Ski-Zunft Kollnau e.V.',
  iban: 'DE61680501010012099212',
  bic: 'FRSPDE66XXX',
  bankName: 'Sparkasse Freiburg-Nördlicher Breisgau',
} as const

/** Course fees are due this many days before the first booked course starts. */
export const PAYMENT_DAYS_BEFORE_COURSE = 5
