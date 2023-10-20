import Icon from '@/components/Icon'
import AttendeeSection from './AttendeeSection'

export default function BookingSelection({
  register,
  errors,
  control,
  attendeeFieldArray,
  defaultAttendeeValues,
  nextStep,
  disciplines = [],
  courses = [],
  courseCategories = [],
}) {
  const { fields, append, remove } = attendeeFieldArray

  return (
    <div>
      {fields.map((field, index) => (
        <AttendeeSection
          key={field.id}
          index={index}
          fields={fields}
          remove={remove}
          register={register}
          control={control}
          courses={courses}
          courseCategories={courseCategories}
          errors={errors}
        />
      ))}
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
        <div className="md:col-span-2 md:col-start-2">
          <button
            onClick={() =>
              append({
                ...defaultAttendeeValues,
              })
            }
            type="button"
            className="relative block w-full rounded-lg border border-dashed border-gray-300 p-6 text-center"
          >
            <div className="inline-flex items-center rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
              <Icon name="person-add-24-regular" className="-ml-0.5 mr-1.5" />
              Weiteres Kind anmelden
            </div>
          </button>
        </div>
      </div>
      <div className="mt-6 flex gap-x-4 md:justify-end">
        <button
          type="button"
          className="flex-1 rounded-full border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 md:min-w-[20%] md:flex-none"
          onClick={() => nextStep()}
        >
          Weiter
        </button>
      </div>
    </div>
  )
}
