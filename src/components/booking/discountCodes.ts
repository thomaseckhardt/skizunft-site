export type DiscountCodeConfig = {
  rate: number
  /** Shown to the booker as the occasion of the discount, e.g. "Brettlemarkt" */
  label: string
}

/** Keys are lowercase, codes from links are matched case-insensitively. */
export const discountCodes: Record<string, DiscountCodeConfig> = {
  // Still printed on an old QR code in use
  // brettlemarkt2025: { rate: 0.1, label: 'Brettlemarkt' },
  // brettlemarkt2026: { rate: 0.1, label: 'Brettlemarkt' },
}
