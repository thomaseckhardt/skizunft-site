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
  size = 'md',
}) {
  const large = size === 'lg'

  return (
    <div
      className={clsx(
        large ? 'text-base leading-6' : 'text-sm leading-6',
        className,
      )}
    >
      {label && (
        <div className="flex justify-between">
          <label
            htmlFor={fieldId}
            className={clsx(
              'block font-medium leading-6 text-gray-900',
              large ? 'text-base' : 'text-sm',
            )}
          >
            {label}
          </label>
          {!required && (
            <span
              className={clsx(
                'leading-6 text-gray-500',
                large ? 'text-base' : 'text-sm',
              )}
              id="email-optional"
            >
              Optional
            </span>
          )}
        </div>
      )}
      <div
        className={clsx(
          'relative rounded-md shadow-sm',
          label && (large ? 'mt-2' : 'mt-1'),
        )}
      >
        {startIcon && (
          <div
            className={clsx(
              'pointer-events-none absolute inset-y-0 left-0 flex items-center text-gray-400',
              large ? 'pl-4' : 'pl-3',
            )}
          >
            <Icon name={startIcon} size={20} />
          </div>
        )}
        <input
          type={type}
          id={id}
          className={clsx(
            'block w-full rounded-md border-0',
            large
              ? 'px-4 py-2 text-lg leading-7'
              : 'py-1.5 sm:text-sm sm:leading-6',
            'ring-1 ring-inset focus:ring-2 focus:ring-inset',
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200',
            error
              ? 'text-red-900 ring-red-300 placeholder:text-red-300 focus:ring-red-500'
              : 'text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-sky-500',
            startIcon && (large ? 'pl-11' : 'pl-10'),
            (endIcon || error) && (large ? 'pr-11' : 'pr-10'),
            inputClassName,
          )}
          placeholder={placeholder}
          name={name}
          {...input}
        />
        {endIcon && !error && (
          <div
            className={clsx(
              'pointer-events-none absolute inset-y-0 right-0 flex items-center',
              large ? 'pr-4' : 'pr-3',
            )}
          >
            <Icon name={endIcon} size={20} />
          </div>
        )}
        {error && (
          <div
            className={clsx(
              'pointer-events-none absolute inset-y-0 right-0 flex items-center text-error-icon',
              large ? 'pr-4' : 'pr-3',
            )}
          >
            <Icon name="error-circle-20-filled" size={20} />
          </div>
        )}
      </div>
      {error && (
        <div
          className={clsx('mt-1 text-error', large ? 'text-base' : 'text-sm')}
        >
          <slot name="error">
            <p>{error}</p>
          </slot>
        </div>
      )}
      {description && (
        <div
          className={clsx(
            'mt-1 text-gray-500',
            large ? 'text-base' : 'text-sm',
          )}
        >
          <p>{description}</p>
        </div>
      )}
    </div>
  )
}
