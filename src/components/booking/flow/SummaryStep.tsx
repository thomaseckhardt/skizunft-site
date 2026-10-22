import Icon from '@/components/Icon'
import { formatPrice } from '@/utils/format'
import clsx from 'clsx'
import { useState, type ReactNode } from 'react'
import type { BookingValues } from '../useSubmitBooking'
import { countBookingSeats, isNoLongerBookable } from './availability'
import type { ContactStepId, FlowAttendee } from './flowState'
import type { StepProps } from './steps'
import {
  ConfirmDialog,
  LinkButton,
  Notice,
  PrimaryButton,
  SecondaryButton,
  StepActions,
  StepShell,
} from './ui'

type SubmitState = 'idle' | 'submitting' | 'failed' | 'mailFailed'

export default function SummaryStep({
  state,
  dispatch,
  catalog,
  pricing,
  seatsTaken,
  submitBooking,
  onSubmitted,
  onCancel,
}: StepProps & {
  submitBooking: (values: BookingValues) => Promise<boolean>
  onSubmitted: () => void
  onCancel: () => void
}) {
  const { booker, attendees } = state
  const [legalConfirmed, setLegalConfirmed] = useState(false)
  const [privacyConfirmed, setPrivacyConfirmed] = useState(false)
  const [photoConsent, setPhotoConsent] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  // Kept after closing, so the dialog content stays during the leave transition.
  const [attendeeToRemove, setAttendeeToRemove] = useState<FlowAttendee>()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  const isSubmitting = submitState === 'submitting'
  const isLocked = isSubmitting || submitState === 'mailFailed'
  const discountPercent = Math.round(pricing.discountRate * 100)

  const getCourse = (slug: string) =>
    catalog.courses.find((course) => course.slug === slug)

  // Once sent, the booking counts towards the seats taken itself, so the
  // check only applies before.
  const bookingSeats = countBookingSeats(attendees)
  const unbookableCourses = isLocked
    ? []
    : Object.keys(bookingSeats).filter((slug) => {
        const course = getCourse(slug)
        return course && isNoLongerBookable(course, seatsTaken, bookingSeats)
      })
  const hasUnbookableCourses = unbookableCourses.length > 0

  const editContact = (step: ContactStepId) =>
    dispatch({ type: 'editContact', step })

  const askToRemoveAttendee = (attendee: FlowAttendee) => {
    setAttendeeToRemove(attendee)
    setConfirmOpen(true)
  }

  const removeCourse = (attendee: FlowAttendee, courseSlug: string) => {
    // Removing the last course removes the attendee as well.
    if (attendee.courses.length === 1) {
      askToRemoveAttendee(attendee)
      return
    }
    dispatch({ type: 'removeCourse', attendeeId: attendee.id, courseSlug })
  }

  const confirmRemoval = () => {
    if (attendeeToRemove) {
      dispatch({ type: 'removeAttendee', attendeeId: attendeeToRemove.id })
    }
    setConfirmOpen(false)
  }

  const submit = async () => {
    if (isLocked || hasUnbookableCourses) return

    const nextErrors = [
      attendees.length === 0 && 'Bitte wähle mindestens einen Kurs aus.',
      !legalConfirmed &&
        'Bitte bestätige unsere Allgemeinen Geschäftsbedingungen.',
      !privacyConfirmed && 'Bitte bestätige unsere Datenschutzerklärung.',
    ].filter(Boolean) as string[]
    setErrors(nextErrors)
    if (nextErrors.length > 0) return

    setSubmitState('submitting')
    try {
      const confirmed = await submitBooking({
        ...booker,
        country: '',
        legalConfirmed,
        privacyConfirmed,
        photoConsent,
        attendees: attendees.map(
          ({ firstName, lastName, age, member, courses }) => ({
            firstName,
            lastName,
            age,
            member,
            courses,
          }),
        ),
      })
      // Once stored, the booking must not be sent a second time.
      onSubmitted()
      setSubmitState(confirmed ? 'submitting' : 'mailFailed')
    } catch (error) {
      console.log('error', error)
      setSubmitState('failed')
    }
  }

  return (
    <StepShell
      title="Deine Buchung im Überblick"
      description="Bitte prüfe deine Angaben, bevor du die Buchung abschickst."
    >
      <div className="space-y-10">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">Kurse</h2>
          {attendees.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">
              Du hast noch keinen Kurs ausgewählt.
            </p>
          ) : (
            <ul role="list" className="mt-2 divide-y divide-gray-200">
              {attendees.map((attendee) => (
                <li key={attendee.id} className="py-4">
                  <div className="flex items-baseline justify-between gap-x-4">
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">
                        {attendee.firstName} {attendee.lastName}
                      </span>{' '}
                      <span className="text-gray-500">
                        ({attendee.age} Jahre
                        {attendee.member && ', Vereinsmitglied'})
                      </span>
                    </div>
                    <div className="whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPrice(pricing.getAttendeeTotalPrice(attendee))}
                    </div>
                  </div>
                  <ul role="list" className="mt-1 space-y-1">
                    {attendee.courses.map((slug) => (
                      <li
                        key={slug}
                        className="flex items-center justify-between gap-x-4 text-sm text-gray-500"
                      >
                        <span>
                          {getCourse(slug)?.name} ·{' '}
                          {getCourse(slug)?.dateShortFormatted}
                          {unbookableCourses.includes(slug) && (
                            <span className="font-medium text-rose-700">
                              {' '}
                              · inzwischen ausgebucht
                            </span>
                          )}
                        </span>
                        {!isLocked && (
                          <button
                            type="button"
                            title="Kurs entfernen"
                            className="flex-none text-gray-400 hover:text-red-500"
                            onClick={() => removeCourse(attendee, slug)}
                          >
                            <Icon name="dismiss-20-regular" size={20} />
                            <span className="sr-only">Kurs entfernen</span>
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                  {!isLocked && (
                    <div className="mt-2 flex gap-x-4">
                      <LinkButton
                        onClick={() =>
                          dispatch({
                            type: 'editAttendee',
                            attendeeId: attendee.id,
                          })
                        }
                      >
                        Ändern
                      </LinkButton>
                      <LinkButton
                        className="text-gray-500 hover:text-red-600"
                        onClick={() => askToRemoveAttendee(attendee)}
                      >
                        Entfernen
                      </LinkButton>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          {!isLocked && (
            <button
              type="button"
              onClick={() => dispatch({ type: 'addCourse' })}
              className="mt-2 flex w-full items-center justify-center gap-x-1.5 rounded-lg border border-dashed border-gray-300 p-4 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              <Icon name="add-20-regular" size={20} />
              Weiteren Kurs hinzufügen
            </button>
          )}

          <dl className="mt-6 space-y-4 border-t border-gray-200 pt-6 text-sm">
            {discountPercent > 0 && (
              <>
                <div className="flex justify-between">
                  <dt>Zwischensumme</dt>
                  <dd className="font-medium text-gray-900">
                    {formatPrice(pricing.getSubtotal(attendees))}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>
                    Rabatt{' '}
                    <span className="text-gray-500">
                      ({discountPercent} % Brettlemarkt)
                    </span>
                  </dt>
                  <dd className="font-medium text-gray-900">
                    −{formatPrice(pricing.getDiscount(attendees))}
                  </dd>
                </div>
              </>
            )}
            <div className="flex justify-between text-base font-semibold text-sky-600 md:text-lg">
              <dt>Fälliger Betrag</dt>
              <dd>{formatPrice(pricing.getTotalPrice(attendees))}</dd>
            </div>
          </dl>
          <div className="mt-4">
            <Notice>
              <p>
                Bitte überweise den fälligen Betrag bis spätestens{' '}
                <span className="whitespace-nowrap font-semibold">5 Tage</span>{' '}
                vor Kursbeginn auf unser Bankkonto. Alle Informationen bekommst
                du in der Buchungsbestätigung per Mail.
              </p>
            </Notice>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">Deine Daten</h2>
          <dl className="mt-2 divide-y divide-gray-200 text-sm">
            <ContactRow
              label="Name"
              onEdit={!isLocked && (() => editContact('bookerLastName'))}
            >
              {booker.firstName} {booker.lastName}
            </ContactRow>
            <ContactRow
              label="E-Mail"
              onEdit={!isLocked && (() => editContact('email'))}
            >
              {booker.email}
            </ContactRow>
            <ContactRow
              label="Telefon"
              onEdit={!isLocked && (() => editContact('phone'))}
            >
              {booker.phone}
            </ContactRow>
            <ContactRow
              label="Adresse"
              onEdit={!isLocked && (() => editContact('address'))}
            >
              {booker.address}, {booker.zip} {booker.city}
            </ContactRow>
          </dl>
        </section>

        <section className="space-y-6">
          <Checkbox
            id="legal"
            label="Allgemeine Geschäftsbedingungen"
            checked={legalConfirmed}
            onChange={setLegalConfirmed}
            disabled={isLocked}
          >
            Ich bestätige, dass ich die{' '}
            <a href="/agb/" target="_blank">
              Allgemeinen Geschäftsbedingungen
            </a>{' '}
            der DSV-Skischule Skizunft Kollnau e.V. gelesen habe und mit ihnen
            einverstanden bin.
          </Checkbox>
          <Checkbox
            id="privacy"
            label="Datenschutzerklärung"
            checked={privacyConfirmed}
            onChange={setPrivacyConfirmed}
            disabled={isLocked}
          >
            Ich habe die{' '}
            <a href="/datenschutz/" target="_blank">
              Datenschutzerklärung
            </a>{' '}
            zur Kenntnis genommen. Ich stimme zu, dass meine Angaben und Daten
            zur Beantwortung meiner Anfrage elektronisch erhoben und gespeichert
            werden. Hinweis: Sie können Ihre Einwilligung jederzeit für die
            Zukunft widerrufen, per E-Mail an info@szkollnau.de
          </Checkbox>
          <Checkbox
            id="photos"
            label="Fotos und Videos (freiwillig)"
            checked={photoConsent}
            onChange={setPhotoConsent}
            disabled={isLocked}
          >
            Ich bin damit einverstanden, dass die DSV-Skischule während der
            Kurse Fotos und Videos macht, auf denen die angemeldeten
            Teilnehmer:innen zu erkennen sind, und diese auf der Website sowie
            auf Instagram und Facebook der Skizunft Kollnau veröffentlicht. Die
            Einwilligung ist freiwillig und hat keinen Einfluss auf die Buchung.
            Ich kann sie jederzeit für die Zukunft per E-Mail an
            info@szkollnau.de widerrufen.
          </Checkbox>
        </section>

        <div className="space-y-4">
          {hasUnbookableCourses && (
            <Notice tone="error">
              <p>
                {unbookableCourses.length === 1
                  ? 'Ein gewählter Kurs ist'
                  : 'Einige gewählte Kurse sind'}{' '}
                inzwischen leider ausgebucht. Bitte entferne{' '}
                {unbookableCourses.length === 1 ? 'ihn' : 'sie'} aus deiner
                Buchung oder wähle einen anderen Termin.
              </p>
            </Notice>
          )}
          {errors.length > 0 && (
            <Notice tone="error">
              <ul role="list" className="list-disc space-y-1 pl-5">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </Notice>
          )}
          {submitState === 'failed' && (
            <Notice tone="error">
              <p>
                Deine Buchung konnte leider nicht gesendet werden. Bitte
                versuche es noch einmal.
              </p>
            </Notice>
          )}
          {submitState === 'mailFailed' && (
            <Notice tone="warning">
              <p>
                Deine Buchung ist bei uns eingegangen, die Bestätigungsmail
                konnte aber nicht verschickt werden. Bitte melde dich unter{' '}
                <a href="mailto:info@szkollnau.de" className="underline">
                  info@szkollnau.de
                </a>
                .
              </p>
            </Notice>
          )}
          <StepActions>
            {!isLocked && (
              <SecondaryButton onClick={() => setCancelOpen(true)}>
                Abbrechen
              </SecondaryButton>
            )}
            <PrimaryButton
              tone="red"
              onClick={submit}
              disabled={isLocked || hasUnbookableCourses}
              className={clsx('sm:ml-auto', isSubmitting && 'cursor-wait')}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-x-2">
                  <svg
                    className="h-5 w-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Buchung wird gesendet …</span>
                </span>
              ) : (
                <span>Zahlungspflichtig buchen</span>
              )}
            </PrimaryButton>
          </StepActions>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Teilnehmer:in entfernen?"
        confirmLabel="Entfernen"
        onConfirm={confirmRemoval}
        onClose={() => setConfirmOpen(false)}
      >
        {attendeeToRemove && (
          <p>
            Möchtest du{' '}
            <span className="font-medium text-gray-900">
              {attendeeToRemove.firstName} {attendeeToRemove.lastName}
            </span>{' '}
            mit{' '}
            {attendeeToRemove.courses.length === 1
              ? 'dem gewählten Kurs'
              : `allen ${attendeeToRemove.courses.length} gewählten Kursen`}{' '}
            aus deiner Buchung entfernen?
          </p>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={cancelOpen}
        title="Buchung abbrechen?"
        confirmLabel="Buchung abbrechen"
        cancelLabel="Weitermachen"
        onConfirm={onCancel}
        onClose={() => setCancelOpen(false)}
      >
        <p>
          Alle bisherigen Eingaben – Teilnehmer:innen, Kurse und deine Daten –
          werden zurückgesetzt und gehen verloren. Das lässt sich nicht
          rückgängig machen.
        </p>
      </ConfirmDialog>
    </StepShell>
  )
}

function ContactRow({
  label,
  onEdit,
  children,
}: {
  label: string
  onEdit: false | (() => void)
  children: ReactNode
}) {
  return (
    <div className="flex items-baseline justify-between gap-x-4 py-3">
      <dt className="w-20 flex-none text-gray-500">{label}</dt>
      <dd className="flex-1 break-words text-gray-900">{children}</dd>
      {onEdit && <LinkButton onClick={onEdit}>Ändern</LinkButton>}
    </div>
  )
}

function Checkbox({
  id,
  label,
  checked,
  onChange,
  disabled,
  children,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled: boolean
  children: ReactNode
}) {
  return (
    <div className="relative flex items-start">
      <div className="flex h-6 items-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          aria-describedby={`${id}-description`}
          className="h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-sky-600"
        />
      </div>
      <div className="ml-3 text-base leading-6">
        <label htmlFor={id} className="font-medium text-gray-900">
          {label}
        </label>
        <p id={`${id}-description`} className="prose prose-gray text-gray-500">
          {children}
        </p>
      </div>
    </div>
  )
}
