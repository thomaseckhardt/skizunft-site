import Icon from '@/components/Icon'
import { useQueries } from 'convex/react'
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { api } from '../../../../convex/_generated/api'
import { createPricing, getDiscountRate } from '../pricing'
import useSubmitBooking from '../useSubmitBooking'
import {
  createFlowReducer,
  createInitialState,
  getCurrentStep,
  getProgress,
  type FlowState,
  type StepId,
} from './flowState'
import {
  AddressStep,
  AgeStep,
  AttendeeChoiceStep,
  AttendeeNameStep,
  BookerLastNameStep,
  CoursesStep,
  DisciplineStep,
  EmailStep,
  MembershipStep,
  NextStep,
  PhoneStep,
  SkillLevelStep,
  type Catalog,
  type StepProps,
} from './steps'
import type { SeatsTaken } from './availability'
import SummaryStep from './SummaryStep'

const storageKey = 'skizunft-booking-flow-v2'

const loadState = (): FlowState => {
  try {
    const stored = JSON.parse(sessionStorage.getItem(storageKey) ?? 'null')
    if (Array.isArray(stored?.steps) && stored.steps.length > 0) return stored
  } catch {
    // Storage may be unavailable, e.g. in private windows.
  }
  return createInitialState()
}

const saveState = (state: FlowState) => {
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(state))
  } catch {
    // Storage may be unavailable, e.g. in private windows.
  }
}

const clearState = () => {
  try {
    sessionStorage.removeItem(storageKey)
  } catch {
    // Storage may be unavailable, e.g. in private windows.
  }
}

// Defined once, so the subscription is not set up again on every render.
const seatsTakenQuery = {
  seatsTaken: { query: api.attendees.seatsTaken, args: {} },
}

/**
 * Seats taken per course, live from Convex. Undefined while loading or when
 * the query fails, so the flow keeps working without automatic booking states.
 */
const useSeatsTaken = (): SeatsTaken | undefined => {
  const { seatsTaken } = useQueries(seatsTakenQuery)
  const failed = seatsTaken instanceof Error
  useEffect(() => {
    if (failed) console.error('Could not load the seats taken', seatsTaken)
  }, [failed])
  return failed ? undefined : seatsTaken
}

const getHistoryDepth = (): number | undefined =>
  window.history.state?.flowDepth

const stepComponents: Record<
  Exclude<StepId, 'summary'>,
  (props: StepProps) => JSX.Element
> = {
  attendeeChoice: AttendeeChoiceStep,
  discipline: DisciplineStep,
  age: AgeStep,
  skillLevel: SkillLevelStep,
  courses: CoursesStep,
  attendeeName: AttendeeNameStep,
  membership: MembershipStep,
  next: NextStep,
  bookerLastName: BookerLastNameStep,
  email: EmailStep,
  phone: PhoneStep,
  address: AddressStep,
}

export default function BookingFlow({
  courses,
  courseCategories,
  disciplines,
}: Catalog) {
  const catalog = { courses, courseCategories, disciplines }
  const reducer = useMemo(
    () => createFlowReducer(courseCategories),
    [courseCategories],
  )
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  const submitted = useRef(false)
  const seatsTaken = useSeatsTaken()

  const discountRate = getDiscountRate(
    new URLSearchParams(window.location.search).get('code'),
  )
  const pricing = createPricing({ courses, courseCategories, discountRate })
  const submitBooking = useSubmitBooking({ courses, pricing })

  const depth = state.steps.length - 1
  const step = getCurrentStep(state)

  // Mirror every step in the browser history, so the browser back button
  // walks back through the flow.
  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      dispatch({ type: 'popTo', depth: event.state?.flowDepth ?? 0 })
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    const historyDepth = getHistoryDepth()
    if (historyDepth === undefined) {
      window.history.replaceState(
        { ...window.history.state, flowDepth: depth },
        '',
      )
    } else if (historyDepth < depth) {
      window.history.pushState({ flowDepth: depth }, '')
    }
    window.scrollTo(0, 0)
  }, [depth, step])

  useEffect(() => {
    if (!submitted.current) saveState(state)
  }, [state])

  const goBack = useCallback(() => {
    if ((getHistoryDepth() ?? 0) > 0) {
      window.history.back()
      return
    }
    // The flow was restored without matching history entries.
    dispatch({ type: 'popTo', depth: depth - 1 })
    window.history.replaceState({ flowDepth: depth - 1 }, '')
  }, [depth])

  const cancel = useCallback(() => {
    dispatch({ type: 'reset' })
    // Walk the history back to the first step, so the browser back button
    // does not lead into the discarded flow.
    const historyDepth = getHistoryDepth() ?? 0
    if (historyDepth > 0) {
      window.history.go(-historyDepth)
    } else {
      window.history.replaceState({ ...window.history.state, flowDepth: 0 }, '')
    }
  }, [])

  const onSubmitted = useCallback(() => {
    submitted.current = true
    clearState()
  }, [])

  const stepProps: StepProps = {
    state,
    dispatch,
    catalog,
    pricing,
    seatsTaken,
    onBack: goBack,
  }
  const StepComponent = step === 'summary' ? undefined : stepComponents[step]

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex h-10 items-center">
        {depth > 0 && (
          <button
            type="button"
            onClick={goBack}
            className="-ml-1 inline-flex items-center gap-x-1 rounded-full py-2 pr-3 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <Icon name="chevron-left-20-regular" size={20} />
            Zurück
          </button>
        )}
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-label="Fortschritt der Buchung"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(getProgress(step) * 100)}
      >
        <div
          className="h-full rounded-full bg-sky-600 transition-all duration-300"
          style={{ width: `${getProgress(step) * 100}%` }}
        />
      </div>
      <div className="mt-6" key={`${depth}-${step}`}>
        {StepComponent ? (
          <StepComponent {...stepProps} />
        ) : (
          <SummaryStep
            {...stepProps}
            submitBooking={submitBooking}
            onSubmitted={onSubmitted}
            onCancel={cancel}
          />
        )}
      </div>
    </div>
  )
}
