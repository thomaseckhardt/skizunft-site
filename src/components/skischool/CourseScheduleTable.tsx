import { ConvexClient } from 'convex/browser'
import { Fragment, useEffect, useState } from 'react'
import clsx from 'clsx'
import Icon from '@/components/Icon'
import { api } from '../../../convex/_generated/api'
import type { SeatsTaken } from '../booking/flow/availability'
import {
  getCellState,
  getScheduleColumns,
  getToday,
  scheduleGroups,
  scheduleRows,
  type CellState,
  type ScheduleCourse,
  type ScheduleRow,
} from './courseSchedule'

let convex: ConvexClient | undefined

/**
 * Seats taken per course, live from Convex. Undefined while loading, when
 * the query fails or while booking is closed, so the table then shows the
 * courses without automatic booking states.
 */
const useSeatsTaken = (enabled: boolean): SeatsTaken | undefined => {
  const [seatsTaken, setSeatsTaken] = useState<SeatsTaken>()
  useEffect(() => {
    if (!enabled) return
    // Created in the browser only, so rendering on the server opens no socket.
    convex ??= new ConvexClient(import.meta.env.PUBLIC_CONVEX_URL as string)
    const unsubscribe = convex.onUpdate(
      api.attendees.seatsTaken,
      {},
      setSeatsTaken,
      (error) => console.error('Could not load the seats taken', error),
    )
    return () => unsubscribe()
  }, [enabled])
  return seatsTaken
}

/**
 * Today, once in the browser. The server renders with the build date, so
 * weekends that ended since the last build disappear after hydration.
 */
const useToday = (buildDate: string) => {
  const [today, setToday] = useState(buildDate)
  useEffect(() => setToday(getToday()), [])
  return today
}

const courseInfoUrl = (row: ScheduleRow) =>
  `/skischule/kurse/#${row.categorySlug}`

function Cell({ state }: { state: CellState }) {
  switch (state) {
    case 'open':
      return (
        <>
          <Icon
            name="checkmark-20-filled"
            size={20}
            className="mx-auto text-sky-600"
            aria-hidden="true"
          />
          <span className="sr-only">Kurs findet statt</span>
        </>
      )
    case 'fewSeatsLeft':
      return (
        <>
          <Icon
            name="checkmark-20-filled"
            size={20}
            className="mx-auto text-sky-600"
            aria-hidden="true"
          />
          <span className="mt-0.5 block text-xs font-medium leading-tight text-sky-600">
            Fast ausgebucht
          </span>
        </>
      )
    case 'lastSeat':
      return (
        <>
          <Icon
            name="checkmark-20-filled"
            size={20}
            className="mx-auto text-rose-700"
            aria-hidden="true"
          />
          <span className="mt-0.5 block text-xs font-medium leading-tight text-rose-700">
            Letzter Platz frei
          </span>
        </>
      )
    case 'fullyBooked':
    case 'closed':
      return (
        <>
          <Icon
            name="dismiss-20-filled"
            size={20}
            className="mx-auto text-rose-700"
            aria-hidden="true"
          />
          <span className="mt-0.5 block text-xs font-medium leading-tight text-rose-700">
            ausgebucht
          </span>
        </>
      )
    case 'canceled':
      return (
        <>
          <Icon
            name="dismiss-20-filled"
            size={20}
            className="mx-auto text-gray-400"
            aria-hidden="true"
          />
          <span className="mt-0.5 block text-xs leading-tight text-gray-500">
            abgesagt
          </span>
        </>
      )
    case 'none':
      return (
        <>
          <span className="text-gray-300" aria-hidden="true">
            –
          </span>
          <span className="sr-only">kein Kurs</span>
        </>
      )
  }
}

const stickyCell = 'sticky left-0 z-10 bg-white'

/** The states the demo row shows, one per column and repeating. */
const demoStates: CellState[] = [
  'fewSeatsLeft',
  'lastSeat',
  'fullyBooked',
  'canceled',
  'open',
  'none',
]

export default function CourseScheduleTable({
  courses,
  buildDate,
  bookingEnabled,
  showDemoRow = false,
}: {
  courses: ScheduleCourse[]
  /** The date the page was built, `YYYY-MM-DD`. */
  buildDate: string
  /** Live booking states need open booking, see PUBLIC_BOOKING_ENABLED. */
  bookingEnabled: boolean
  /** Adds a row that shows every cell state, for local testing only. */
  showDemoRow?: boolean
}) {
  const today = useToday(buildDate)
  const seatsTaken = useSeatsTaken(bookingEnabled)
  const columns = getScheduleColumns(courses, today)

  if (columns.length === 0) {
    return (
      <p className="text-center text-gray-600">
        Aktuell sind keine Kurstermine geplant. Schau bald wieder vorbei!
      </p>
    )
  }

  return (
    <div>
      <div className="-mx-4 overflow-x-auto px-4">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th scope="col" className={clsx(stickyCell, 'py-3 pr-4 text-left')}>
                <span className="sr-only">Kurs</span>
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="whitespace-nowrap px-3 py-3 text-center font-semibold text-gray-900"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scheduleRows.map((row, index) => {
              const group = row.group ? scheduleGroups[row.group] : undefined
              const startsGroup =
                group !== undefined && scheduleRows[index - 1]?.group !== row.group
              const states = columns.map((column) =>
                getCellState(courses, row, column, seatsTaken),
              )
              const hasCourses = states.some((state) => state !== 'none')

              return (
                <Fragment key={row.categorySlug}>
                  {startsGroup && (
                    <tr className="border-t border-gray-200">
                      <th
                        scope="colgroup"
                        className={clsx(stickyCell, 'pb-1 pr-4 pt-3 text-left')}
                      >
                        <span className="block font-semibold text-gray-900">
                          {group.title}
                        </span>
                        <span className="block text-xs font-normal text-gray-500">
                          {group.age}
                        </span>
                      </th>
                      <td colSpan={columns.length} />
                    </tr>
                  )}
                  <tr
                    className={clsx(
                      !group && 'border-t border-gray-200',
                      group && !startsGroup && 'border-t border-gray-100',
                    )}
                  >
                    <th
                      scope="row"
                      className={clsx(
                        stickyCell,
                        'py-3 pr-4 text-left font-normal',
                        group && 'pl-3',
                      )}
                    >
                      <a
                        href={courseInfoUrl(row)}
                        className={clsx(
                          'block whitespace-nowrap hover:text-sky-600',
                          group ? 'text-gray-700' : 'font-semibold text-gray-900',
                        )}
                      >
                        {row.title}
                      </a>
                      {row.age && (
                        <span className="block text-xs text-gray-500">
                          {row.age}
                        </span>
                      )}
                    </th>
                    {!hasCourses && row.noCoursesMessage ? (
                      <td
                        colSpan={columns.length}
                        className="px-3 py-3 text-center text-sm italic text-gray-500"
                      >
                        {row.noCoursesMessage}
                      </td>
                    ) : (
                      states.map((state, index) => (
                        <td
                          key={columns[index].key}
                          className="min-w-24 px-3 py-3 text-center align-middle"
                        >
                          <Cell state={state} />
                        </td>
                      ))
                    )}
                  </tr>
                </Fragment>
              )
            })}
            {showDemoRow && (
              <tr className="border-t border-dashed ">
                <th
                  scope="row"
                  className={clsx(stickyCell, '!bg-amber-50 py-3 pr-4 text-left')}
                >
                  <span className="block font-semibold text-amber-800">
                    Demo
                  </span>
                  <span className="block text-xs font-normal text-amber-700">
                    nur lokal sichtbar
                  </span>
                </th>
                {columns.map((column, index) => (
                  <td
                    key={column.key}
                    className="min-w-24 px-3 py-3 text-center align-middle"
                  >
                    <Cell state={demoStates[index % demoStates.length]} />
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-4 flex items-center justify-center gap-x-1.5 text-xs text-gray-500">
        <Icon
          name="checkmark-16-filled"
          size={16}
          className="text-sky-600"
          aria-hidden="true"
        />
        Kurs findet statt · jeweils Samstag und Sonntag
      </p>
    </div>
  )
}
