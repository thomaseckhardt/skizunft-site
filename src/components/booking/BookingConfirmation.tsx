import { formatPrice } from '@/utils/format';
import Icon from '../Icon';
import TextField from './TextField';
import clsx from 'clsx';

export default function BookingConfirmation({
  className = '',
  attendees = [],
  register,
  errors,
  getAttendeeTotalPrice,
  getSubtotal,
  getDiscount,
  getTotalPrice,
  courses = [],
  formState,
  prevStep
}) {
  const getCourseDetails = (courseSlug) => {
    const course = courses.find((course) => courseSlug === course.slug);
    return `${course.name} · ${course.dateShortFormatted}`;
  };

  return (
    <div
      className={clsx(
        'grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3',
        className
      )}
    >
      <div className='px-4 sm:px-0'>
        <div className='sticky top-4'>
          <div className='mt-10 lg:mt-0'>
            <h2 className='text-lg font-medium text-gray-900'>
              Zusammenfassung
            </h2>

            <div className='mt-4'>
              <h3 className='sr-only'>Kurse in deinem Warenkorb</h3>
              <ul role='list' className='divide-y divide-gray-200'>
                {attendees.map((attendee, index) => (
                  <li key={index} className='py-6'>
                    <div className='min-w-0 flex-1'>
                      <h4 className='flex gap-x-1 text-sm'>
                        <span className='truncate font-medium text-gray-700'>
                          {attendee.firstName} {attendee.lastName}
                        </span>
                        <span className='flex-none'>
                          ({attendee.age} Jahre)
                        </span>
                      </h4>
                      <div className='mt-1'>
                        {attendee.courses.map((courseSlug) => (
                          <p key={courseSlug} className='text-sm text-gray-500'>
                            {getCourseDetails(courseSlug)}
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className='mt-1 flex justify-end gap-x-2 text-right text-sm'>
                      {attendee.member && (
                        <p className='text-gray-500'>Vereinsmitglied</p>
                      )}
                      <p className='font-medium text-gray-900'>
                        {formatPrice(getAttendeeTotalPrice(attendee))}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className='space-y-6 border-t border-gray-200 py-6'>
                <div className='flex items-center justify-between'>
                  <div className='text-sm'>Zwischensumme</div>
                  <div className='text-sm font-medium text-gray-900'>
                    {formatPrice(getSubtotal(attendees))}
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='text-sm'>
                    Rabatt{' '}
                    <span className='text-gray-500'>(10% Brettlemarkt)</span>
                  </div>
                  <div className='text-sm font-medium text-gray-900'>
                    {formatPrice(getDiscount(attendees))}
                  </div>
                </div>
                <div className='flex items-center justify-between border-t border-gray-200 pt-6 text-sky-600'>
                  <div className='text-base font-semibold md:text-lg'>
                    Fälliger Betrag
                  </div>
                  <div className='text-base font-semibold md:text-lg'>
                    {formatPrice(getTotalPrice(attendees))}
                  </div>
                </div>
                <div className='mt-6 rounded border border-sky-600 bg-sky-50 p-4 text-sm text-sky-700'>
                  Bitte überweise den fälligen Betrag bis spätestens{' '}
                  <span className='whitespace-nowrap font-semibold'>
                    5 Tage
                  </span>{' '}
                  vor Kursbeginn auf unser Bankkonto. Alle Infor­mationen
                  bekommst du in der Buchungs­bestätigung per Mail.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='md:col-span-2'>
        <div className='sticky top-4 space-y-10'>
          <div className='rounded bg-white px-4 py-6 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl sm:p-8'>
            <h2 className='text-lg font-semibold leading-6 text-gray-900'>
              Deine Daten
            </h2>
            <div className='prose prose-sm prose-gray mt-2'>
              <p>
                Du bist unser Vertragspartner und Kontaktperson, an die wir uns
                den Kursbetrieb betreffend, wenden.
              </p>
            </div>
            <div className='relative mt-6 grid gap-x-6 gap-y-6 sm:grid-cols-2'>
              <TextField
                label='Dein Vorname'
                id='firstName'
                input={register('firstName' as const, {
                  required: {
                    value: true,
                    message: 'Bitte gib deinen Vornamen an.'
                  }
                })}
                error={errors?.firstName?.message}
              />
              <TextField
                label='Dein Nachname'
                id='lastName'
                input={register('lastName' as const, {
                  required: {
                    value: true,
                    message: 'Bitte gib deinen Nachnamen an.'
                  }
                })}
                error={errors?.lastName?.message}
              />
              <TextField
                label='Deine E-Mail'
                id='email'
                type='email'
                description='An diese E-Mail wird die Buchungsbestätigung geschickt. Darüber hinaus nehmen wir nur Kontakt auf, sofern es Kursrelevante Informationen gibt.'
                input={register('email' as const, {
                  required: {
                    value: true,
                    message: 'Bitte gib deine E-Mail-Adresse an.'
                  }
                })}
                error={errors?.email?.message}
                className='sm:col-span-2'
                startIcon='mail-24-regular'
              />
              <TextField
                id='phone'
                label='Deine Telefonnummer'
                placeholder='z.B. 01601234567'
                description='Eine Telefonnummer unter der wir dich auch am Tag des Kurses gut erreichen können.'
                input={register('phone' as const, {
                  required: {
                    value: true,
                    message: 'Bitte gib deine Telefonnummer an.'
                  }
                })}
                error={errors?.phone?.message}
                className='sm:col-span-2'
                startIcon='phone-24-regular'
              />
            </div>
            <div className='mt-12'>
              <h2 className='text-lg font-semibold leading-6 text-gray-900'>
                Rechnungsadresse
              </h2>
              <div className='relative mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-3'>
                <TextField
                  id='address'
                  label='Adresse'
                  input={register('address' as const, {
                    required: {
                      value: true,
                      message: 'Bitte gib deine Anschrift an.'
                    }
                  })}
                  error={errors?.address?.message}
                  className='sm:col-span-3'
                />
                <TextField
                  label='PLZ'
                  id='zip'
                  input={register('zip' as const, {
                    required: {
                      value: true,
                      message: 'Bitte gib deine Postleitzahl an.'
                    }
                  })}
                  error={errors?.zip?.message}
                />
                <TextField
                  label='Stadt'
                  id='city'
                  input={register('city' as const, {
                    required: {
                      value: true,
                      message: 'Bitte gib deinen Wohnort an.'
                    }
                  })}
                  error={errors?.city?.message}
                  className='sm:col-span-2'
                />
              </div>
            </div>
          </div>
          <div className='space-y-6 md:col-span-2 md:col-start-2'>
            <div className='relative flex items-start'>
              <div className='flex h-6 items-center'>
                <input
                  id='legal'
                  {...register('legalConfirmed' as const, {
                    required: {
                      value: true,
                      message:
                        'Bitte bestätige unsere Allgemeinen Geschäftsbedingungen.'
                    }
                  })}
                  aria-describedby='legal-description'
                  type='checkbox'
                  className='h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-600'
                />
              </div>
              <div className='ml-3 text-sm leading-6'>
                <label htmlFor='legal' className='font-medium text-gray-900'>
                  Allgemeine Geschäftbedingungen
                </label>
                <p
                  id='agb-description'
                  className='prose prose-sm prose-gray text-gray-500'
                >
                  Ich bestätige, dass ich die{' '}
                  <a href='/agb/' target='_blank'>
                    Allgemeinen Geschäftsbedingungen
                  </a>{' '}
                  der DSV-Skischule Skizunft Kollnau e.V. gelesen habe und mit
                  ihnen einverstanden bin.
                </p>
                {errors?.legalConfirmed?.message && (
                  <div className='mt-1 flex gap-x-1 text-sm text-error'>
                    <div className='mt-[0.125em] flex-none text-error-icon'>
                      <Icon name='error-circle-20-filled' size={20} />
                    </div>
                    <p>{errors?.legalConfirmed?.message}</p>
                  </div>
                )}
              </div>
            </div>
            <div className='relative flex items-start'>
              <div className='flex h-6 items-center'>
                <input
                  id='privacy'
                  {...register('privacyConfirmed' as const, {
                    required: {
                      value: true,
                      message: 'Bitte bestätige unsere Datenschutzerklärung.'
                    }
                  })}
                  aria-describedby='privacy-description'
                  type='checkbox'
                  className='h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-600'
                />
              </div>
              <div className='ml-3 text-sm leading-6'>
                <label htmlFor='privacy' className='font-medium text-gray-900'>
                  Datenschutzerklärung
                </label>
                <p
                  id='privacy-description'
                  className='prose prose-sm prose-gray text-gray-500'
                >
                  Ich habe die{' '}
                  <a href='/datenschutz/' target='_blank'>
                    Datenschutzerklärung
                  </a>{' '}
                  zur Kenntnis genommen. Ich stimme zu, dass meine Angaben und
                  Daten zur Beantwortung meiner Anfrage elektronisch erhoben und
                  gespeichert werden. Hinweis: Sie können Ihre Einwilligung
                  jederzeit für die Zukunft widerrufen, per E-Mail an
                  info@szkollnau.de
                </p>
                {errors?.privacyConfirmed?.message && (
                  <div className='mt-1 flex gap-x-1 text-sm text-error'>
                    <div className='mt-[0.125em] flex-none text-error-icon'>
                      <Icon name='error-circle-20-filled' size={20} />
                    </div>
                    <p>{errors?.privacyConfirmed?.message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            <div className='flex flex-wrap  gap-x-4 gap-y-4'>
              <button
                type='button'
                className='w-full rounded-full bg-white px-8 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 md:w-auto md:flex-none'
                onClick={() => prevStep()}
                disabled={formState?.isSubmitted}
              >
                Zurück
              </button>
              <button
                type='submit'
                className={clsx(
                  'inline-flex w-full max-w-md flex-1 items-center rounded-full border border-transparent bg-sky-600 px-8 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 md:w-auto md:flex-none',
                  formState?.isSubmitted
                    ? 'cursor-wait bg-sky-700'
                    : 'bg-sky-600'
                )}
                disabled={formState?.isSubmitted__}
              >
                {formState?.isSubmitted ? (
                  <span className='inline-flex items-center gap-x-2'>
                    <svg
                      className='h-5 w-5 animate-spin'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    <span>Kursbuchung wird gesendet …</span>
                  </span>
                ) : (
                  <span>Kursbuchung senden</span>
                )}
              </button>
            </div>
            {Object.keys(errors).length > 0 && (
              <div className='mt-4 rounded-md bg-red-50 p-4'>
                <div className='flex'>
                  <div className='mt-[0.125em] flex-shrink-0 text-error-icon'>
                    <Icon name='error-circle-20-filled' size={20} />
                  </div>
                  <div className='ml-2'>
                    <h3 className='text-sm font-medium text-red-800'>
                      Es gab {Object.keys(errors).length} Fehler bei deiner
                      Eingabe:
                    </h3>
                    <div className='mt-2 text-xs text-red-700 md:text-sm'>
                      <ul role='list' className='list-disc space-y-1 pl-5'>
                        {Object.entries(errors).map(([fieldName, error]) => (
                          <li key={fieldName}>{error.message}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
