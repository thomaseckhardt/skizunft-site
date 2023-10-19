import clsx from 'clsx'

export default function Input({
  type = 'text',
  id,
  error,
  startIcon,
  endIcon,
  placeholder,
  name,
  ...props
}) {
  return (
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
      )}
      placeholder={placeholder}
      name={name}
      {...props}
    />
  )
}
