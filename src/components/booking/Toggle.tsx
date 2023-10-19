import { useState } from 'react'
import { useWatch } from 'react-hook-form'
import clsx from 'clsx'
import Icon from '../Icon'

export default function Toggle({ control, input, label = undefined }) {
  // const [enabled, setEnabled] = useState(false)

  const enabled = useWatch({
    control,
    name: input?.name,
  })

  return (
    <label
      className={clsx(
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2',
        enabled ? 'bg-sky-600' : 'bg-gray-200',
      )}
    >
      <input type="checkbox" {...input} className="sr-only" />
      <span className="sr-only">{label}</span>
      <span
        className={clsx(
          'pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          enabled ? 'translate-x-5' : 'translate-x-0',
        )}
      >
        <span
          className={clsx(
            'absolute inset-0 flex h-full w-full items-center justify-center text-gray-400 transition-opacity',
            enabled
              ? 'opacity-0 duration-200 ease-out'
              : 'opacity-100 duration-100 ease-in',
          )}
          aria-hidden="true"
        >
          <Icon name="dismiss-12-regular" width={12} height={12} />
        </span>
        <span
          className={clsx(
            'absolute inset-0 flex h-full w-full items-center justify-center text-sky-600 transition-opacity',
            enabled
              ? 'opacity-100 duration-100 ease-in'
              : 'opacity-0 duration-200 ease-out',
          )}
          aria-hidden="true"
        >
          <Icon name="checkmark-12-regular" width={12} height={12} />
        </span>
      </span>
    </label>
  )
}
