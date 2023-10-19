import Icon from '@/components/Icon'

const disciplines = [
  {
    value: 'Ski',
    label: 'Skikurs',
    description: 'Für Kinder ab 4 bis einschließlich 13 Jahren',
    minAge: 4,
    maxAge: 13,
  },
  {
    value: 'Snowboard',
    label: 'Snowboardkurs',
    description: 'Für Kinder ab 6 bis einschließlich 13 Jahren',
    minAge: 6,
    maxAge: 13,
  },
]

export default function DisciplineSelection({
  label,
  name,
  value,
  onChange,
  ...props
}) {
  return (
    <fieldset {...props}>
      <legend className="text-lg font-semibold leading-6 text-gray-900">
        {label}
      </legend>
      <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4 lg:grid-cols-3">
        {disciplines.map((discipline) => (
          <label
            key={discipline.value}
            className="relative flex cursor-pointer rounded-lg bg-white p-4 shadow-sm focus:outline-none"
          >
            <input
              type="radio"
              className="peer sr-only"
              name={name}
              value={discipline.value}
              checked={value === discipline.value}
              onChange={() => onChange(discipline.value)}
            />
            <span className="relative z-10 flex flex-1">
              <span className="flex flex-col">
                <span
                  id="project-type-0-label"
                  className="block text-sm font-medium text-gray-900"
                >
                  {discipline.label}
                </span>
                <span className="mt-1 flex items-center text-sm leading-normal text-gray-500">
                  {discipline.description}
                </span>
              </span>
            </span>
            <span className="invisible relative z-10 flex-none text-sky-600 peer-checked:visible">
              <Icon name="checkmark-circle-20-filled" width={20} height={20} />
            </span>
            <span
              className="pointer-events-none absolute -inset-px rounded-lg ring-1 ring-inset ring-gray-300 peer-checked:ring-2 peer-checked:ring-sky-600"
              aria-hidden="true"
            ></span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
