import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import AttendeeRow from './AttendeeRow'
import clsx from 'clsx'
import { sendConfirmationManually } from './sendConfirmationManually'

const bookingIds = [
  // Development Buchung
  'j97888hxw4yq7shb7x07wfq5d973cwt5',
  // Meine Buchung Production
  'j97236t93pacnhv7qnf0nhe3mh748wbr',
  //
  'j97c3pknsqx0eev70k13k3k4m173cxen',
  'j971k91ahehb6zmxq958c0zjx573dbgh',
  'j97bnw411prcgj6xja2wqjtym973dsk2',
  'j973rgch4gbkn8s36s77v3ppeh73d1qt',
  'j972nzdawgxznhwrhgajpwz1pn73d0ge',
  'j97by92x4vx6dfjr1f5yjkreg973dqmp',
  'j973gqbm3f8ac9hgkba6rvxzc973dfkd',
  'j9782bpwgfhcyjxrwsj0yc28yn73dv6d',
  'j97dgjggc3arwc09xmwgz3g6e573dk53',
  'j978ta7pyq1nbg7dhtx4bsbj0d73dc2z',
  'j973srh35d9w69b0snjcypeegs73c67q',
]

function ConfirmationAdmin({ courses, courseCategories }) {
  const allBookings = useQuery(api.bookings.list)
  const allAttendees = useQuery(api.attendees.list)
  const bookings =
    allBookings
      ?.filter((booking) => bookingIds.includes(booking._id))
      .map((booking) => ({
        ...booking,
        attendees: allAttendees.filter(
          (attendee) => attendee.bookingId === booking._id,
        ),
      })) ?? []

  const requestConfirmationMail = async (booking) => {
    if (
      window.confirm(
        `Send mail to\n${booking.firstName} ${booking.lastName}\n${booking.email}?`,
      )
    ) {
      sendConfirmationManually({
        booking,
        courses,
        courseCategories,
      })
    }
  }

  return (
    <div>
      <div className="space-y-10">
        {bookings &&
          bookings.map((booking) => (
            <div key={booking._id}>
              <div className="grid grid-cols-7 gap-x-6">
                <div>{booking._id}</div>
                <div>{booking.firstName}</div>
                <div>{booking.lastName}</div>
                <div>{booking.address}</div>
                <div>{booking.phone}</div>
                <div>{booking.email}</div>
                <div>
                  <button
                    type="submit"
                    className={clsx(
                      'inline-flex w-full flex-auto items-center justify-center rounded-full border border-transparent bg-sky-600 px-8 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 md:w-auto md:max-w-md md:flex-none',
                    )}
                    onClick={() => requestConfirmationMail(booking)}
                  >
                    Send Mail
                  </button>
                </div>
                {booking.attendees?.map((attendee) => (
                  <AttendeeRow
                    attendee={attendee}
                    key={attendee._id}
                    className="col-span-6 col-start-2"
                  />
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default ConfirmationAdmin
