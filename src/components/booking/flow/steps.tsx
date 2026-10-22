import Icon from '@/components/Icon'
import { formatPrice } from '@/utils/format'
import { useState, type Dispatch } from 'react'
import CategoryInformationDialog from '../CategoryInformationDialog'
import CourseSelectionItem from '../CourseSelectionItem'
import type { Pricing } from '../pricing'
import TextField from '../TextField'
import {
  countBookingSeats,
  getFreeSeats,
  withAvailability,
  type SeatsTaken,
} from './availability'
import {
  getMatchingCategories,
  type Discipline,
  type FlowAction,
  type FlowState,
} from './flowState'
import {
  ChoiceList,
  ChoiceStep,
  FormStep,
  LinkButton,
  Notice,
  PrimaryButton,
  SecondaryButton,
  StepShell,
} from './ui'

export type Catalog = {
  courses: any[]
  courseCategories: any[]
  disciplines: Record<
    Discipline,
    {
      value: Discipline
      label: string
      description: string
      enabled: boolean
      disabledMessage?: string
    }
  >
}

export type StepProps = {
  state: FlowState
  dispatch: Dispatch<FlowAction>
  catalog: Catalog
  pricing: Pricing
  seatsTaken: SeatsTaken | undefined
  /** Undefined on the first step, where there is nothing to go back to. */
  onBack?: () => void
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const textInput = (
  value: string,
  setValue: (value: string) => void,
  props: Record<string, unknown> = {},
) => ({
  value,
  onChange: (event) => setValue(event.target.value),
  ...props,
})

const getCategory = ({
  catalog,
  state,
}: Pick<StepProps, 'catalog' | 'state'>) =>
  catalog.courseCategories.find(({ id }) => id === state.draft.categoryId)

// --------------------------------------------------

export function AttendeeChoiceStep({ state, dispatch, onBack }: StepProps) {
  const choices = [
    ...state.attendees.map((attendee) => ({
      value: attendee.id,
      label: `${attendee.firstName} ${attendee.lastName}`,
      description: `${attendee.age} Jahre · bisher ${attendee.courses.length} ${
        attendee.courses.length === 1 ? 'Kurs' : 'Kurse'
      }`,
    })),
    {
      value: null,
      label: 'Neue Person',
      description:
        'Eine weitere Teilnehmerin oder einen weiteren Teilnehmer anmelden',
    },
  ]

  return (
    <StepShell
      title="Für wen möchtest du einen weiteren Kurs buchen?"
      onBack={onBack}
    >
      <ChoiceList
        choices={choices}
        onSelect={(attendeeId) =>
          dispatch({ type: 'chooseAttendee', attendeeId })
        }
      />
    </StepShell>
  )
}

// --------------------------------------------------

export function DisciplineStep({
  state,
  dispatch,
  catalog,
  onBack,
}: StepProps) {
  const { draft, attendees } = state
  const isFirstCourse = attendees.length === 0 && draft.isNewAttendee

  const title = draft.isNewAttendee
    ? isFirstCourse
      ? 'Hallo, welchen Kurs möchtest du buchen?'
      : 'Welchen Kurs möchtest du buchen?'
    : `Welchen Kurs möchte ${draft.firstName} machen?`

  const choices = Object.values(catalog.disciplines).map((discipline) => {
    if (!discipline.enabled) {
      return {
        value: discipline.value,
        label: discipline.label,
        description: discipline.disabledMessage,
        disabled: true,
      }
    }

    // The age of an already known attendee rules out unsuitable disciplines.
    const unavailable =
      !draft.isNewAttendee &&
      getMatchingCategories(
        catalog.courseCategories,
        discipline.value,
        draft.age,
      ).length === 0

    return {
      value: discipline.value,
      label: discipline.label,
      description: unavailable
        ? `Für ${draft.age}-Jährige bieten wir leider keinen ${discipline.label} an.`
        : discipline.description,
      disabled: unavailable,
    }
  })

  return (
    <ChoiceStep
      title={title}
      onBack={onBack}
      choices={choices}
      selected={draft.discipline}
      onSelect={(discipline) =>
        dispatch({ type: 'chooseDiscipline', discipline })
      }
    />
  )
}

// --------------------------------------------------

export function AgeStep({ state, dispatch, catalog, onBack }: StepProps) {
  const { draft } = state
  const discipline = catalog.disciplines[draft.discipline]
  const [age, setAge] = useState(
    draft.age === undefined ? '' : String(draft.age),
  )
  const [error, setError] = useState<string>()
  const [unavailableAge, setUnavailableAge] = useState<number>()

  const changeAge = (value: string) => {
    setAge(value)
    setError(undefined)
    setUnavailableAge(undefined)
  }

  const submit = () => {
    const parsedAge = Number(age)
    if (
      !age ||
      !Number.isInteger(parsedAge) ||
      parsedAge < 1 ||
      parsedAge > 99
    ) {
      setError('Bitte gib ein gültiges Alter an.')
      return
    }
    const matches = getMatchingCategories(
      catalog.courseCategories,
      draft.discipline,
      parsedAge,
    )
    if (matches.length === 0) {
      setUnavailableAge(parsedAge)
      return
    }
    dispatch({ type: 'setAge', age: parsedAge })
  }

  return (
    <FormStep
      title="Wie alt ist die Person, die am Kurs teilnimmt?"
      description={
        discipline && `${discipline.label}: ${discipline.description}`
      }
      onSubmit={submit}
      onBack={onBack}
    >
      <TextField
        size="lg"
        label="Alter in Jahren"
        id="attendee-age"
        fieldId="attendee-age"
        type="number"
        inputClassName="max-w-[8rem]"
        input={textInput(age, changeAge, {
          autoFocus: true,
          inputMode: 'numeric',
          min: 1,
          max: 99,
        })}
        error={error}
      />
      {unavailableAge !== undefined && discipline && (
        <Notice tone="warning">
          <p>
            Für {unavailableAge}-Jährige bieten wir leider keinen{' '}
            {discipline.label} an. {discipline.label}e gibt es{' '}
            {discipline.description.charAt(0).toLowerCase() +
              discipline.description.slice(1)}
            .
          </p>
          <LinkButton onClick={onBack}>Andere Kursart wählen</LinkButton>
        </Notice>
      )}
    </FormStep>
  )
}

// --------------------------------------------------

export function SkillLevelStep({
  state,
  dispatch,
  catalog,
  onBack,
}: StepProps) {
  const [infoOpen, setInfoOpen] = useState(false)
  const categories = getMatchingCategories(
    catalog.courseCategories,
    state.draft.discipline,
    state.draft.age,
  )

  return (
    <ChoiceStep
      title="Welche Könnensstufe passt?"
      description={
        <div className="space-y-3">
          <p>
            Wir bieten Kurse für unterschiedliche Könnensstufen. Vom absoluten
            Anfänger bis hin zum Champion.
          </p>
          <LinkButton onClick={() => setInfoOpen(true)} className="text-left">
            <Icon name="info-24-regular" className="text-sky-600" />
            <span>Erfahre hier, welche Könnensstufe passt</span>
          </LinkButton>
        </div>
      }
      onBack={onBack}
      choices={categories.map((category) => ({
        value: category.id,
        label: category.name,
      }))}
      selected={state.draft.categoryId}
      onSelect={(categoryId) =>
        dispatch({ type: 'chooseCategory', categoryId })
      }
    >
      <CategoryInformationDialog open={infoOpen} setOpen={setInfoOpen} />
    </ChoiceStep>
  )
}

// --------------------------------------------------

export function CoursesStep(props: StepProps) {
  const { state, dispatch, catalog, seatsTaken, onBack } = props
  const { draft } = state
  const category = getCategory(props)
  // Other attendees of this booking take seats as well.
  const bookingSeats = countBookingSeats(state.attendees, draft.attendeeId)
  const categoryCourses = catalog.courses
    .filter((course) => category && course.categoryId === category.id)
    .map((course) =>
      withAvailability(course, getFreeSeats(course, seatsTaken, bookingSeats)),
    )
  const hasBookableCourses = categoryCourses.some((course) => !course.disabled)
  const [selected, setSelected] = useState<string[]>(draft.courses)
  const [error, setError] = useState<string>()

  if (!hasBookableCourses) {
    return <NoCoursesMessage {...props} categoryName={category?.name} />
  }

  const toggle = (slug: string) => {
    setError(undefined)
    setSelected((current) =>
      current.includes(slug)
        ? current.filter((value) => value !== slug)
        : [...current, slug],
    )
  }

  const submit = () => {
    if (selected.length === 0) {
      setError('Bitte wähle mindestens einen Termin aus.')
      return
    }
    // Keep the catalog order, regardless of the order of clicks, and drop
    // courses that were fully booked in the meantime.
    const courses = categoryCourses
      .filter(({ slug, disabled }) => selected.includes(slug) && !disabled)
      .map(({ slug }) => slug)
    if (courses.length === 0) {
      setError('Der gewählte Termin ist inzwischen leider ausgebucht.')
      return
    }
    dispatch({ type: 'setCourses', courses })
  }

  return (
    <FormStep
      title="Welche Termine passen?"
      description={
        <>
          <p className="font-medium text-gray-900">{category.name}</p>
          <p>Du kannst auch mehrere Termine auswählen.</p>
        </>
      }
      onSubmit={submit}
      onBack={onBack}
    >
      <div className="space-y-2">
        {categoryCourses.map((course) => {
          const alreadyBooked = draft.baseCourses.includes(course.slug)
          return (
            <CourseSelectionItem
              key={course.id}
              course={
                alreadyBooked
                  ? {
                      ...course,
                      availability: undefined,
                      disabled: true,
                      bookingStateMessage: 'bereits ausgewählt',
                      bookingStateColor: 'grey',
                    }
                  : course
              }
              inputProps={{
                checked: selected.includes(course.slug),
                onChange: () => toggle(course.slug),
              }}
            />
          )
        })}
      </div>
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
        <div>
          <span className="text-lg font-semibold text-gray-900">
            {category.priceFormatted}
          </span>{' '}
          pro Kurs
        </div>
        <div>
          <span className="text-lg font-semibold text-sky-600">
            {category.priceMemberFormatted}
          </span>{' '}
          pro Kurs für Vereinsmitglieder
        </div>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
    </FormStep>
  )
}

function NoCoursesMessage({
  state,
  dispatch,
  catalog,
  onBack,
  categoryName,
}: StepProps & { categoryName?: string }) {
  const hasSkillLevelChoice =
    getMatchingCategories(
      catalog.courseCategories,
      state.draft.discipline,
      state.draft.age,
    ).length > 1

  return (
    <StepShell
      title="Leider sind keine Termine mehr frei"
      description={
        categoryName
          ? `Für „${categoryName}“ können wir dir aktuell keinen freien Termin anbieten.`
          : 'Für deine Auswahl können wir dir aktuell keinen freien Termin anbieten.'
      }
      onBack={onBack}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {hasSkillLevelChoice && (
          <SecondaryButton onClick={onBack}>
            Andere Könnensstufe wählen
          </SecondaryButton>
        )}
        <SecondaryButton
          onClick={() => dispatch({ type: 'goto', step: 'discipline' })}
        >
          Andere Kursart wählen
        </SecondaryButton>
        {state.attendees.length > 0 && (
          <PrimaryButton onClick={() => dispatch({ type: 'finish' })}>
            Buchung abschließen
          </PrimaryButton>
        )}
      </div>
    </StepShell>
  )
}

// --------------------------------------------------

export function AttendeeNameStep({ state, dispatch, onBack }: StepProps) {
  const [firstName, setFirstName] = useState(state.draft.firstName)
  const [lastName, setLastName] = useState(state.draft.lastName)
  const [errors, setErrors] = useState<{
    firstName?: string
    lastName?: string
  }>({})

  const submit = () => {
    const nextErrors = {
      firstName: firstName.trim() ? undefined : 'Bitte gib den Vornamen an.',
      lastName: lastName.trim() ? undefined : 'Bitte gib den Nachnamen an.',
    }
    setErrors(nextErrors)
    if (nextErrors.firstName || nextErrors.lastName) return
    dispatch({
      type: 'setAttendeeName',
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    })
  }

  return (
    <FormStep
      title="Wie heißt die Person, die am Kurs teilnimmt?"
      onSubmit={submit}
      onBack={onBack}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          size="lg"
          label="Vorname"
          id="attendee-firstName"
          fieldId="attendee-firstName"
          placeholder="der teilnehmenden Person"
          input={textInput(firstName, setFirstName, { autoFocus: true })}
          error={errors.firstName}
        />
        <TextField
          size="lg"
          label="Nachname"
          id="attendee-lastName"
          fieldId="attendee-lastName"
          placeholder="der teilnehmenden Person"
          input={textInput(lastName, setLastName)}
          error={errors.lastName}
        />
      </div>
    </FormStep>
  )
}

// --------------------------------------------------

export function MembershipStep(props: StepProps) {
  const { state, dispatch, onBack } = props
  const category = getCategory(props)

  return (
    <ChoiceStep
      title={`Ist ${state.draft.firstName} Vereinsmitglied der Skizunft Kollnau?`}
      description="Vereinsmitglieder zahlen für alle Kurse den reduzierten Mitgliederpreis."
      onBack={onBack}
      choices={[
        {
          value: true,
          label: 'Ja, ist Vereinsmitglied',
          description: category && `${category.priceMemberFormatted} pro Kurs`,
        },
        {
          value: false,
          label: 'Nein, kein Vereinsmitglied',
          description: category && `${category.priceFormatted} pro Kurs`,
        },
      ]}
      selected={state.draft.member}
      onSelect={(member) => dispatch({ type: 'setMembership', member })}
    />
  )
}

// --------------------------------------------------

export function CartOverview({ state, catalog, pricing }: StepProps) {
  const getCourse = (slug: string) =>
    catalog.courses.find((course) => course.slug === slug)

  return (
    <div className="rounded-lg bg-gray-50 p-4 text-sm">
      <h2 className="font-semibold text-gray-900">Bisher ausgewählt</h2>
      <ul role="list" className="mt-2 divide-y divide-gray-200">
        {state.attendees.map((attendee) => (
          <li key={attendee.id} className="flex justify-between gap-x-4 py-3">
            <div>
              <div className="font-medium text-gray-900">
                {attendee.firstName} {attendee.lastName}
              </div>
              {attendee.courses.map((slug) => (
                <div key={slug} className="text-gray-500">
                  {getCourse(slug)?.name} ·{' '}
                  {getCourse(slug)?.dateShortFormatted}
                </div>
              ))}
            </div>
            <div className="whitespace-nowrap font-medium text-gray-900">
              {formatPrice(pricing.getAttendeeTotalPrice(attendee))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function NextStep(props: StepProps) {
  const { state, dispatch, onBack } = props

  return (
    <StepShell
      title="Möchtest du einen weiteren Kurs buchen?"
      onBack={onBack}
      actions={
        state.attendees.length > 0 && (
          <PrimaryButton
            tone="red"
            className="sm:ml-auto"
            onClick={() => dispatch({ type: 'finish' })}
          >
            Buchung abschließen
          </PrimaryButton>
        )
      }
    >
      <div className="space-y-8">
        <ChoiceList
          choices={[
            {
              value: 'addCourse' as const,
              label: 'Weiteren Kurs buchen',
              description:
                'Für eine bereits angemeldete oder eine weitere Person',
            },
          ]}
          onSelect={(type) => dispatch({ type })}
        />
        {state.attendees.length > 0 && <CartOverview {...props} />}
      </div>
    </StepShell>
  )
}

// --------------------------------------------------

export function BookerLastNameStep({ state, dispatch, onBack }: StepProps) {
  const [firstName, setFirstName] = useState(state.booker.firstName)
  const [lastName, setLastName] = useState(state.booker.lastName)
  const [errors, setErrors] = useState<{
    firstName?: string
    lastName?: string
  }>({})

  const submit = () => {
    const nextErrors = {
      firstName: firstName.trim() ? undefined : 'Bitte gib deinen Vornamen an.',
      lastName: lastName.trim() ? undefined : 'Bitte gib deinen Nachnamen an.',
    }
    setErrors(nextErrors)
    if (nextErrors.firstName || nextErrors.lastName) return
    dispatch({
      type: 'setBookerName',
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    })
  }

  return (
    <FormStep
      title="Fast geschafft! Wie heißt du?"
      description="Du bist unser Vertragspartner und die Kontaktperson, an die wir uns in allen Fragen zum Kursbetrieb wenden."
      onSubmit={submit}
      onBack={onBack}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          size="lg"
          label="Dein Vorname"
          id="booker-firstName"
          fieldId="booker-firstName"
          input={textInput(firstName, setFirstName, {
            autoFocus: !firstName,
            autoComplete: 'given-name',
          })}
          error={errors.firstName}
        />
        <TextField
          size="lg"
          label="Dein Nachname"
          id="booker-lastName"
          fieldId="booker-lastName"
          input={textInput(lastName, setLastName, {
            autoFocus: !!firstName,
            autoComplete: 'family-name',
          })}
          error={errors.lastName}
        />
      </div>
    </FormStep>
  )
}

export function EmailStep({ state, dispatch, onBack }: StepProps) {
  const [email, setEmail] = useState(state.booker.email)
  const [error, setError] = useState<string>()

  const submit = () => {
    if (!email.trim()) {
      setError('Bitte gib deine E-Mail-Adresse an.')
      return
    }
    if (!emailPattern.test(email.trim())) {
      setError('Bitte gib eine gültige E-Mail-Adresse an.')
      return
    }
    dispatch({ type: 'setEmail', email: email.trim() })
  }

  return (
    <FormStep
      title="Wie lautet deine E-Mail-Adresse?"
      description="An diese E-Mail-Adresse schicken wir die Buchungsbestätigung. Darüber hinaus melden wir uns nur, wenn es kursrelevante Informationen gibt."
      onSubmit={submit}
      onBack={onBack}
    >
      <TextField
        size="lg"
        label="Deine E-Mail"
        id="booker-email"
        fieldId="booker-email"
        type="email"
        startIcon="mail-24-regular"
        input={textInput(email, setEmail, {
          autoFocus: true,
          autoComplete: 'email',
        })}
        error={error}
      />
    </FormStep>
  )
}

export function PhoneStep({ state, dispatch, onBack }: StepProps) {
  const [phone, setPhone] = useState(state.booker.phone)
  const [error, setError] = useState<string>()

  const submit = () => {
    if (!phone.trim()) {
      setError('Bitte gib deine Telefonnummer an.')
      return
    }
    dispatch({ type: 'setPhone', phone: phone.trim() })
  }

  return (
    <FormStep
      title="Unter welcher Telefonnummer erreichen wir dich?"
      description="Am besten eine Nummer, unter der wir dich auch am Tag des Kurses gut erreichen."
      onSubmit={submit}
      onBack={onBack}
    >
      <TextField
        size="lg"
        label="Deine Telefonnummer"
        id="booker-phone"
        fieldId="booker-phone"
        type="tel"
        placeholder="z.B. 01601234567"
        startIcon="phone-24-regular"
        input={textInput(phone, setPhone, {
          autoFocus: true,
          autoComplete: 'tel',
        })}
        error={error}
      />
    </FormStep>
  )
}

export function AddressStep({ state, dispatch, onBack }: StepProps) {
  const [address, setAddress] = useState(state.booker.address)
  const [zip, setZip] = useState(state.booker.zip)
  const [city, setCity] = useState(state.booker.city)
  const [errors, setErrors] = useState<{
    address?: string
    zip?: string
    city?: string
  }>({})

  const submit = () => {
    const nextErrors = {
      address: address.trim() ? undefined : 'Bitte gib deine Anschrift an.',
      zip: zip.trim() ? undefined : 'Bitte gib deine Postleitzahl an.',
      city: city.trim() ? undefined : 'Bitte gib deinen Wohnort an.',
    }
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return
    dispatch({
      type: 'setAddress',
      address: address.trim(),
      zip: zip.trim(),
      city: city.trim(),
    })
  }

  return (
    <FormStep
      title="Wie lautet deine Rechnungsadresse?"
      onSubmit={submit}
      onBack={onBack}
    >
      <div className="grid gap-6 sm:grid-cols-3">
        <TextField
          size="lg"
          label="Straße und Hausnummer"
          id="booker-address"
          fieldId="booker-address"
          className="sm:col-span-3"
          input={textInput(address, setAddress, {
            autoFocus: true,
            autoComplete: 'street-address',
          })}
          error={errors.address}
        />
        <TextField
          size="lg"
          label="PLZ"
          id="booker-zip"
          fieldId="booker-zip"
          input={textInput(zip, setZip, {
            autoComplete: 'postal-code',
            inputMode: 'numeric',
          })}
          error={errors.zip}
        />
        <TextField
          size="lg"
          label="Ort"
          id="booker-city"
          fieldId="booker-city"
          className="sm:col-span-2"
          input={textInput(city, setCity, { autoComplete: 'address-level2' })}
          error={errors.city}
        />
      </div>
    </FormStep>
  )
}
