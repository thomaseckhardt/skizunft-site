import { CheckIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { BANK_ACCOUNT, PAYMENT_DAYS_BEFORE_COURSE } from '@/config/bank'
import { formatPrice } from '@/utils/format'
import {
  formatDueDate,
  formatIban,
  getGiroCodeUrl,
  getPaymentDueDate,
} from '@/utils/payment'
import { loadPaymentSession } from './paymentSession'

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard not available, the value can still be selected by hand
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="flex-none rounded-md p-2 text-sky-600 hover:bg-sky-100"
      aria-label={copied ? `${label} kopiert` : `${label} kopieren`}
    >
      {copied ? (
        <CheckIcon className="size-5" />
      ) : (
        <ClipboardDocumentIcon className="size-5" />
      )}
    </button>
  )
}

function Row({
  label,
  value,
  copyValue = value,
}: {
  label: string
  value: string
  copyValue?: string
}) {
  return (
    <div className="flex items-center justify-between gap-x-4 py-2">
      <div className="min-w-0">
        <dt className="text-sm text-sky-700">{label}</dt>
        <dd className="break-words font-semibold text-brandblue-700">
          {value}
        </dd>
      </div>
      <CopyButton value={copyValue} label={label} />
    </div>
  )
}

/**
 * Payment details and GiroCode of the booking that was just submitted.
 * Renders nothing when the page is opened without a booking in this tab.
 */
export default function PaymentDetails() {
  const [payment] = useState(loadPaymentSession)
  if (!payment) return null

  const price = formatPrice(payment.amount)
  const dueDay = payment.firstCourseStart
    ? getPaymentDueDate(new Date(payment.firstCourseStart))
    : undefined

  return (
    <section className="mx-auto mt-12 max-w-2xl rounded-2xl border border-sky-600 bg-sky-50 p-4 text-left sm:p-8">
      <h2 className="font-hero text-2xl text-brandblue-700">
        Jetzt überweisen
      </h2>
      <p className="mt-2 text-sky-700">
        {dueDay === undefined && (
          <>
            Bitte überweise <b>{price}</b> bis spätestens{' '}
            {PAYMENT_DAYS_BEFORE_COURSE} Tage vor Kursbeginn.
          </>
        )}
        {dueDay === null && (
          <>
            Dein Kurs beginnt bald. Bitte überweise <b>{price}</b> umgehend.
          </>
        )}
        {dueDay && (
          <>
            Bitte überweise <b>{price}</b> bis spätestens{' '}
            <b>{formatDueDate(dueDay)}</b>.
          </>
        )}
      </p>

      <div className="mt-6 grid gap-8 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <dl className="divide-y divide-sky-200">
            <Row
              label="Betrag"
              value={price}
              copyValue={payment.amount.toFixed(2).replace('.', ',')}
            />
            <Row label="Empfänger" value={BANK_ACCOUNT.accountHolder} />
            <Row
              label="IBAN"
              value={formatIban(BANK_ACCOUNT.iban)}
              copyValue={BANK_ACCOUNT.iban}
            />
            <Row label="Verwendungszweck" value={payment.reference} />
          </dl>
          <p className="pt-2 text-sm text-sky-700">
            {BANK_ACCOUNT.bankName}
            <br />
            BIC: {BANK_ACCOUNT.bic}
          </p>
        </div>

        <figure className="mx-auto text-center">
          <img
            src={getGiroCodeUrl('', payment)}
            alt="GiroCode für die Überweisung"
            width={150}
            height={150}
            className="mx-auto bg-white"
          />
          <figcaption className="mt-2 text-sm text-sky-700">
            Mit deiner Banking-App scannen
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
