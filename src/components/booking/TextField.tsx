import clsx from 'clsx'
import Icon from '@/components/Icon'

export default function TextField({
  className = undefined,
  inputClassName = undefined,
  fieldId = undefined,
  label = undefined,
  required = true,
  startIcon = undefined,
  endIcon = undefined,
  error = undefined,
  id = undefined,
  name = undefined,
  placeholder = undefined,
  type = 'text',
  description = '',
  input = undefined,
}) {
  return (
    <div className={clsx('text-sm leading-6', className)}>
      {label && (
        <div className="flex justify-between">
          <label
            htmlFor={fieldId}
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            {label}
          </label>
          {!required && (
            <span
              className="text-sm leading-6 text-gray-500"
              id="email-optional"
            >
              Optional
            </span>
          )}
        </div>
      )}
      <div className={clsx('relative rounded-md shadow-sm', label && 'mt-1')}>
        {startIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Icon name={startIcon} size={20} />
          </div>
        )}
        <input
          type={type}
          id={id}
          className={clsx(
            'block w-full rounded-md border-0 py-1.5 ',
            'sm:text-sm sm:leading-6',
            'ring-1 ring-inset focus:ring-2 focus:ring-inset',
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200',
            error
              ? 'text-red-900 ring-red-300 placeholder:text-red-300 focus:ring-red-500'
              : 'text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-sky-500',
            startIcon && 'pl-10',
            (endIcon || error) && 'pr-10',
            inputClassName,
          )}
          placeholder={placeholder}
          name={name}
          {...input}
        />
        {endIcon && !error && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <Icon name={endIcon} size={20} />
          </div>
        )}
        {error && (
          <div className="text-error-icon pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <Icon name="error-circle-20-filled" size={20} />
          </div>
        )}
      </div>
      {error && (
        <div className="text-error mt-1 text-sm">
          <slot name="error">
            <p>{error}</p>
          </slot>
        </div>
      )}
      {description && (
        <div className="mt-1 text-sm text-gray-500">
          <p>{description}</p>
        </div>
      )}
    </div>
  )
}
