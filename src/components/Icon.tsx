import { Icon as ReactIcon } from '@iconify/react'
import clsx from 'clsx'

export default function Icon({
  pack = 'fluent',
  name = 'warning-24-filled',
  filename = undefined,
  className = '',
  width = 24,
  height = 24,
  size = undefined,
  ...props
}) {
  const icon = filename ?? `${pack}:${name}`

  return (
    <ReactIcon
      icon={icon}
      className={clsx('flex-none', className)}
      width={size ?? width}
      height={size ?? height}
      {...props}
    />
  )
}
