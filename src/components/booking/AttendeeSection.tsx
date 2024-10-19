import { useState, useEffect } from 'react'
import { useWatch } from 'react-hook-form'
import Icon from '@/components/Icon'
import TextField from './TextField'
import MembershipToggle from './MembershipToggle'
import DisciplineSelection from './DisciplineSelection'
import CategorySelection from './CategorySelection'
import clsx from 'clsx'
import CourseSelection from './CourseSelection'
import { formatPrice } from '@/utils/format'
import CategoryInformationDialog from './CategoryInformationDialog'

export default function AttendeeSection({
  errors,
  index,
  fields,
  remove,
  register,
  control,
  courses: allCourses,
  courseCategories: allCategories,
  getAttendeeTotalPrice,
}) {
  const [discipline, setDiscipline] = useState('Ski')
  const [category, setCatgeory] = useState()
  const [categories, setCategories] = useState()
  const [courses, setCourses] = useState()
  const [categoryInfoOpen, setOpenCategoryInfoOpen] = useState(false)

  const attendeeAge = useWatch({
    control,
    name: `attendees.${index}.age`,
  })
  const attendeeName = useWatch({
    control,
    name: `attendees.${index}.firstName`,
  })
  const attendeeMember = useWatch({
    control,
    name: `attendees.${index}.member`,
  })
  const attendeeCourses = useWatch({
    control,
    name: `attendees.${index}.courses`,
  })

  useEffect(() => {
    const categories = allCategories.filter(
      (category) =>
        category.discipline === discipline &&
        category.maxAge >= attendeeAge &&
        category.minAge <= attendeeAge,
    )
    const category = categories.length === 1 ? categories[0] : undefined
    setCatgeory(category)

    setCategories(categories)
  }, [attendeeAge, discipline, allCategories])

  useEffect(() => {
    const courses = allCourses.filter(
      (course) => course.categoryId === category?.id,
    )
    setCourses(courses)
  }, [category])

  const handleChangeDicipline = (value) => {
    setDiscipline(value)
    setCourses(undefined)
  }

  const handleChangeCategory = (value) => {
    setCatgeory(value)
    setCourses(undefined)
  }

  const getError = (fieldName) => {
    return errors?.attendees?.[index]?.[fieldName]?.message
  }

  const categoryIntroduction = (
    <div className="mt-5 text-sm">
      <p>
        Wir bieten Kurse für unterschiedliche Könnenstufen. Vom absoluten
        Anfänger, bis hin zum Champion.
      </p>
      <div className="mt-3">
        <button
          type="button"
          className="inline-flex gap-x-1 text-left font-medium text-sky-600 underline"
          onClick={() => setOpenCategoryInfoOpen(true)}
        >
          <Icon
            name="info-24-regular"
            className="flex-none text-sky-600"
            width={24}
            height={24}
          />
          <span>Erfahre hier welche Könnenstufe zu deinem Kind passt</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 py-10 md:grid-cols-3">
        <div className="px-4 sm:px-0">
          <div className="sticky top-4">
            <h3 className="text-xl font-semibold leading-7 text-gray-900">
              <span>{index + 1}</span>. Kind
            </h3>
            {attendeeName && (
              <div className="mt-1 hidden text-lg text-sky-500 md:block">
                <div>
                  {attendeeName && <span>{attendeeName}</span>}
                  {attendeeAge && (
                    <span>
                      , <span>{attendeeAge}</span> Jahre
                    </span>
                  )}
                </div>
                <div className="text-gray-500">
                  {discipline && <span>macht einen {discipline} Kurs</span>}
                </div>
              </div>
            )}
            {fields.length > 1 && (
              <div className="mt-2">
                <button
                  onClick={() => remove(index)}
                  type="button"
                  className="inline-flex items-center py-2 text-sm font-semibold text-gray-900 transition hovers:hover:text-red-500"
                >
                  <Icon
                    name="person-delete-24-regular"
                    className="-ml-0.5 mr-1.5"
                  />
                  nicht anmelden
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-10 md:col-span-2">
          <div className="rounded bg-white px-4 py-6 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl sm:p-8">
            <div className="relative space-y-6">
              <DisciplineSelection
                label="Welchen Kurs möchtest du buchen?"
                name={`attendees.${index}.discipline`}
                value={discipline}
                onChange={handleChangeDicipline}
              />
              <TextField
                label="Vorname"
                placeholder="des Kindes"
                id={`attendees.${index}.firstName`}
                input={register(`attendees.${index}.firstName` as const, {
                  required: {
                    value: true,
                    message: 'Bitte gib den Namens des Kindes an.',
                  },
                })}
                error={getError('firstName')}
              />
              <TextField
                label="Nachname"
                placeholder="des Kindes"
                id={`attendees.${index}.lastName`}
                input={register(`attendees.${index}.lastName` as const, {
                  required: {
                    value: true,
                    message: 'Bitte gib den Nachnamen des Kindes an.',
                  },
                })}
                error={getError('lastName')}
              />
              <TextField
                label="Alter"
                description="Skikurse ab 4 Jahren. Snowboardkurse für Kinder zwischen 6 und 13 Jahren."
                type="number"
                id={`attendees.${index}.age`}
                input={register(`attendees.${index}.age` as const, {
                  valueAsNumber: true,
                  required: {
                    value: true,
                    message: 'Bitte das Alter des Kindes an.',
                  },
                })}
                error={getError('age')}
              />
              <MembershipToggle
                attendeeNameField={`attendees.${index}.firstName`}
                input={register(`attendees.${index}.member`)}
                control={control}
              />
              {categories?.length > 1 && (
                <CategorySelection
                  name={`attendees.${index}.category`}
                  label="Könnensstufe"
                  categories={categories}
                  onChange={handleChangeCategory}
                  introduction={categoryIntroduction}
                ></CategorySelection>
              )}
              {categories?.length > 0 && (
                <fieldset className="!mt-12">
                  <legend className="text-lg font-semibold leading-6 text-gray-900">
                    Kurstermine
                  </legend>
                  {courses?.length > 0 && (
                    <div>
                      <div className="mt-4 flex items-baseline gap-x-2 text-sm">
                        <div
                          className={clsx(
                            'text-lg font-semibold',
                            attendeeMember && 'line-through',
                          )}
                        >
                          {category?.priceFormatted}
                        </div>
                        {attendeeMember && (
                          <div className="text-lg font-semibold text-sky-500">
                            {category?.priceMemberFormatted}
                          </div>
                        )}
                        <div>pro Kurs</div>
                      </div>

                      <CourseSelection
                        register={register}
                        errors={errors}
                        courses={courses}
                        name={`attendees.${index}.courses`}
                      />

                      <div className="mt-6">
                        <div className="flex items-baseline justify-end gap-x-6 text-base font-semibold leading-6 text-gray-900">
                          <div>Gesamtbetrag</div>
                          <div className="text-2xl">
                            {formatPrice(
                              getAttendeeTotalPrice({
                                courses: attendeeCourses,
                                member: attendeeMember,
                              }),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {courses?.length === 0 && (
                    <div className="relative mt-4 flex items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-500">
                      {category
                        ? 'Für deine Auswahl konnten wir leider keine Termine finden.'
                        : 'Bitte wähle zunächst eine Könnensstufe aus, um die Termine zu sehen.'}
                    </div>
                  )}
                </fieldset>
              )}
              {fields.length > 1 && (
                <button
                  type="button"
                  className="absolute right-0 top-0 !mt-0"
                  title="Kind nicht anmelden"
                  onClick={() => remove(index)}
                >
                  <Icon
                    name="delete-24-regular"
                    className="-ml-0.5 mr-1.5 text-red-500"
                  />
                  <span className="sr-only">Kind nicht anmelden</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <CategoryInformationDialog
        open={categoryInfoOpen}
        setOpen={setOpenCategoryInfoOpen}
      />
    </>
  )
}
