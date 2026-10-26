import { formatPercent, type Discount } from '../pricing'
import { Notice } from './ui'

/** Tells the booker whether the Discount Code of their link applies. */
export default function DiscountNotice({
  discount,
  className = undefined,
}: {
  discount: Discount
  className?: string
}) {
  if (discount.status === 'none') return null

  if (discount.status === 'invalid') {
    return (
      <Notice tone="warning" className={className}>
        <p>
          Der Rabattcode „{discount.code}“ ist leider nicht mehr gültig. Du
          kannst trotzdem zum regulären Preis buchen.
        </p>
      </Notice>
    )
  }

  return (
    <Notice tone="success" icon="tag-20-regular" className={className}>
      <p>
        <span className="font-semibold">Rabattcode aktiv:</span>{' '}
        {formatPercent(discount.rate)} {discount.label}-Rabatt auf alle Kurse
      </p>
    </Notice>
  )
}
