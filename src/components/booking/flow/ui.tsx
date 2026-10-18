import Icon from '@/components/Icon'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import clsx from 'clsx'
import type { FormEvent, ReactNode } from 'react'

export function StepShell({
  title,
  description = undefined,
  children,
}: {
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold leading-tight text-gray-900 md:text-3xl">
        {title}
      </h1>
      {description && (
        <div className="mt-3 text-base text-gray-600">{description}</div>
      )}
      <div className="mt-8">{children}</div>
    </div>
  )
}

/** A step answered via input fields and a "Weiter" button (or Enter). */
export function FormStep({
  title,
  description = undefined,
  onSubmit,
  submitLabel = 'Weiter',
  children,
}: {
  title: ReactNode
  description?: ReactNode
  onSubmit: () => void
  submitLabel?: string
  children: ReactNode
}) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <StepShell title={title} description={description}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-6">{children}</div>
        <div className="mt-8">
          <PrimaryButton type="submit">{submitLabel}</PrimaryButton>
        </div>
      </form>
    </StepShell>
  )
}

export function PrimaryButton({
  children,
  className = undefined,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex w-full items-center justify-center rounded-full border border-transparent bg-sky-600 px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({
  children,
  className = undefined,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex w-full items-center justify-center rounded-full bg-white px-8 py-3 text-base font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:w-auto',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function LinkButton({
  children,
  className = undefined,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex items-center gap-x-1 text-sm font-medium text-sky-600 underline hover:text-sky-700',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export type Choice<T> = {
  value: T
  label: ReactNode
  description?: ReactNode
  disabled?: boolean
}

/** Large tappable options; selecting one immediately answers the step. */
export function ChoiceList<T>({
  choices,
  selected = undefined,
  onSelect,
}: {
  choices: Choice<T>[]
  selected?: T
  onSelect: (value: T) => void
}) {
  return (
    <div className="space-y-3">
      {choices.map((choice) => {
        const isSelected = selected !== undefined && choice.value === selected
        return (
          <button
            key={String(choice.value)}
            type="button"
            disabled={choice.disabled}
            onClick={() => onSelect(choice.value)}
            className={clsx(
              'relative flex w-full items-center rounded-lg bg-white p-4 text-left shadow-sm ring-inset focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-600',
              isSelected ? 'ring-2 ring-sky-600' : 'ring-1 ring-gray-300',
              choice.disabled
                ? 'cursor-not-allowed bg-gray-50'
                : 'hover:ring-sky-400',
            )}
          >
            <span className="flex flex-1 flex-col">
              <span
                className={clsx(
                  'block text-base font-medium',
                  choice.disabled ? 'text-gray-500' : 'text-gray-900',
                )}
              >
                {choice.label}
              </span>
              {choice.description && (
                <span className="mt-1 text-sm text-gray-500">
                  {choice.description}
                </span>
              )}
            </span>
            <Icon
              name={
                isSelected
                  ? 'checkmark-circle-24-filled'
                  : 'chevron-right-24-regular'
              }
              className={clsx(
                'ml-3',
                isSelected ? 'text-sky-600' : 'text-gray-400',
                choice.disabled && 'invisible',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

export function Notice({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'warning' | 'error'
  children: ReactNode
}) {
  return (
    <div
      role={tone === 'info' ? 'status' : 'alert'}
      className={clsx(
        'flex gap-x-2 rounded-md p-4 text-sm',
        tone === 'info' && 'border border-sky-600 bg-sky-50 text-sky-700',
        tone === 'warning' &&
          'border border-amber-300 bg-amber-50 text-amber-800',
        tone === 'error' && 'bg-red-50 text-red-800',
      )}
    >
      <Icon
        name={tone === 'info' ? 'info-20-regular' : 'warning-20-regular'}
        size={20}
        className="mt-[0.125em]"
      />
      <div className="space-y-3">{children}</div>
    </div>
  )
}

/** Modal asking the user to confirm a destructive action. */
export function ConfirmDialog({
  open,
  title,
  confirmLabel,
  onConfirm,
  onClose,
  children,
}: {
  open: boolean
  title: ReactNode
  confirmLabel: string
  onConfirm: () => void
  onClose: () => void
  children: ReactNode
}) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-overlays">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity duration-200 data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 sm:items-center">
          <DialogPanel
            transition
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl transition duration-200 data-[closed]:translate-y-4 data-[closed]:opacity-0 sm:data-[closed]:translate-y-0 sm:data-[closed]:scale-95"
          >
            <div className="flex gap-x-4">
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-red-100">
                <Icon
                  name="warning-24-regular"
                  className="text-red-600"
                  aria-hidden="true"
                />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-gray-900">
                  {title}
                </DialogTitle>
                <div className="mt-2 text-sm text-gray-600">{children}</div>
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <SecondaryButton onClick={onClose}>Abbrechen</SecondaryButton>
              <button
                type="button"
                onClick={onConfirm}
                className="inline-flex w-full items-center justify-center rounded-full bg-red-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:w-auto"
              >
                {confirmLabel}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
