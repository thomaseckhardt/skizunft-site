import clsx from 'clsx'

export default function AttendeeRow({ className, attendee }) {
  return (
    <div className={clsx('grid grid-cols-7 gap-x-2', className)}>
      <div>{attendee.bookingId}</div>
      <div>{attendee.firstName}</div>
      <div>{attendee.lastName}</div>
      <div>{attendee.age}</div>
      <div>{attendee.member}</div>
      <div>{attendee.courses}</div>
      <div>{attendee.priceTotal}</div>
    </div>
  )
}
