import Icon from '../Icon'

export default function CategorySelection({
  label,
  name,
  onChange,
  categories,
  introduction,
  ...props
}) {
  return (
    <fieldset {...props}>
      <legend className="text-lg font-semibold leading-6 text-gray-900">
        {label}
      </legend>
      {introduction}

      <div className="mt-4 space-y-4">
        {categories.map((category) => (
          <label
            key={category.id}
            className="relative flex cursor-pointer rounded-lg bg-white p-4 text-sm shadow-sm focus:outline-none"
          >
            <input
              type="radio"
              name={name}
              className="peer sr-only"
              value={category.value}
              onChange={() => onChange(category)}
            />
            <span className="relative z-10 flex flex-1">
              <span className="flex flex-col">
                <span className="block font-medium text-gray-900">
                  {category.name}
                </span>
              </span>
            </span>
            <span className="invisible relative z-10 text-sky-600 peer-checked:visible">
              <Icon name="checkmark-circle-24-filled" width={20} height={20} />
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
