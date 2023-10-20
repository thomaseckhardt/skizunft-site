export default function BookingConfirmation({ attendees = [] }) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
      <div className="px-4 sm:px-0">
        <div className="sticky top-4">
          <div className="mt-10 lg:mt-0">
            <h2 className="text-lg font-medium text-gray-900">
              Zusammenfassung
            </h2>

            <div className="mt-4">
              <h3 className="sr-only">Kurse in deinem Warenkorb</h3>
              <ul role="list" className="divide-y divide-gray-200">
                {attendees.map((attendee) => (
                  <li className="py-6">
                    <div className="min-w-0 flex-1">
                      <h4 className="flex gap-x-1 text-sm">
                        <span className="truncate font-medium text-gray-700">
                          {attendee.firstname} {attendee.lastname}
                        </span>
                        <span className="flex-none">
                          ({attendee.age} Jahre)
                        </span>
                      </h4>
                      <div className="mt-1">
                        {attendee.courses.map((course) => (
                          <p className="text-sm text-gray-500">{course}</p>
                        ))}
                      </div>
                    </div>
                    <div className="mt-1 flex justify-end gap-x-2 text-right text-sm">
                      {attendee.member && (
                        <p className="text-gray-500">Vereinsmitglied</p>
                      )}
                      <p className="font-medium text-gray-900">
                        x-text="formatPrice(getPriceFinal(attendee))"
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="space-y-6 border-t border-gray-200 py-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm">Zwischensumme</div>
                  <div className="text-sm font-medium text-gray-900">
                    x-text="formatPrice(getSubtotal())"
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    Rabatt{' '}
                    <span className="text-gray-500">(10% Brettlemarkt)</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    x-text="formatPrice(getDiscount())"
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-6 text-sky-600">
                  <div className="text-base font-semibold md:text-lg">
                    Fälliger Betrag
                  </div>
                  <div className="text-base font-semibold md:text-lg">
                    x-text="formatPrice(getTotal())"
                  </div>
                </div>
                <div className="mt-6 rounded border border-sky-600 bg-sky-50 p-4 text-sm text-sky-700">
                  Bitte überweise den fälligen Betrag bis spätestens{' '}
                  <span className="whitespace-nowrap font-semibold">
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

      <div className="md:col-span-2">
        <div className="sticky top-4 space-y-10">
          <div className="rounded bg-white px-4 py-6 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl sm:p-8">
            <h2 className="text-lg font-semibold leading-6 text-gray-900">
              Deine Daten
            </h2>
            <div className="prose prose-sm prose-gray mt-2">
              <p>
                Du bist unser Vertragspartner und Kontaktperson, an die wir uns
                den Kursbetrieb betreffend, wenden.
              </p>
            </div>
            <div className="relative mt-6 grid gap-x-6 gap-y-6 sm:grid-cols-2">
              {/* <TextField
              name="firstname"
              label="Dein Vorname"
              xModel="firstname"
            />
            <TextField
              name="lastname"
              label="Dein Nachname"
              xModel="lastname"
            />
            <TextField
              name="email"
              type="email"
              className="sm:col-span-2"
              startIcon="mail-24-regular"
              label="Deine E-Mail"
              name="email"
              xModel="email"
              description="An diese E-Mail wird die Buchungsbestätigung geschickt. Darüber hinaus nehmen wir nur Kontakt auf, sofern es Kursrelevante Informationen gibt."
            />
            <TextField
              name="phone"
              className="sm:col-span-2"
              startIcon="phone-24-regular"
              label="Deine Telefonnummer"
              xModel="phone"
              placeholder="z.B. 01601234567"
              description="Eine Telefonnummer unter der wir dich auch am Tag des Kurses gut erreichen können."
            /> */}
            </div>
            <div className="mt-12">
              <h2 className="text-lg font-semibold leading-6 text-gray-900">
                Rechnungsadresse
              </h2>
              <div className="relative mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-3">
                {/* <TextField
                name="address"
                label="Adresse"
                xModel="address"
                className="sm:col-span-3"
              />
              <TextField label="PLZ" xModel="postalCode" />
              <TextField
                name="city"
                label="Stadt"
                xModel="city"
                className="sm:col-span-2"
              /> */}
              </div>
            </div>
          </div>
          <div className="space-y-6 md:col-span-2 md:col-start-2">
            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  id="agb"
                  aria-describedby="agb-description"
                  name="agb"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-600"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="agb" className="font-medium text-gray-900">
                  Allgemeine Geschäftbedingungen
                </label>
                <p
                  id="agb-description"
                  className="prose prose-sm prose-gray text-gray-500"
                >
                  Ich bestätige, dass ich die{' '}
                  <a href="/agb/" target="_blank">
                    Allgemeinen Geschäftsbedingungen
                  </a>{' '}
                  der Skischule Oberstaufen gelesen habe und mit ihnen
                  einverstanden bin.
                </p>
              </div>
            </div>
            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  id="privacy"
                  aria-describedby="privacy-description"
                  name="privacy"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-600"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="privacy" className="font-medium text-gray-900">
                  Datenschutzerklärung
                </label>
                <p
                  id="privacy-description"
                  className="prose prose-sm prose-gray text-gray-500"
                >
                  Ich habe die{' '}
                  <a href="/datenschutz/" target="_blank">
                    Datenschutzerklärung
                  </a>{' '}
                  zur Kenntnis genommen. Ich stimme zu, dass meine Angaben und
                  Daten zur Beantwortung meiner Anfrage elektronisch erhoben und
                  gespeichert werden. Hinweis: Sie können Ihre Einwilligung
                  jederzeit für die Zukunft widerrufen, per E-Mail an
                  info@szkollnau.de
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-x-4">
            <button
              type="submit"
              className="w-full max-w-md flex-1 rounded-full border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 md:min-w-[20%] md:flex-none"
            >
              Kursbuchung senden
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
