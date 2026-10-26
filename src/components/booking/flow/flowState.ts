export type Discipline = 'Ski' | 'Snowboard'

export type StepId =
  | 'attendeeChoice'
  | 'discipline'
  | 'age'
  | 'skillLevel'
  | 'courses'
  | 'attendeeName'
  | 'membership'
  | 'next'
  | 'bookerLastName'
  | 'email'
  | 'phone'
  | 'address'
  | 'summary'

export type ContactStepId = 'bookerLastName' | 'email' | 'phone' | 'address'

export type CourseCategory = {
  id: string
  discipline: Discipline
  minAge: number
  maxAge: number
}

export type FlowAttendee = {
  id: string
  firstName: string
  lastName: string
  age: number
  member: boolean
  courses: string[]
}

/** The attendee and course choice currently being walked through. */
export type Draft = {
  attendeeId: string
  isNewAttendee: boolean
  /** Courses the attendee already had before this draft started. */
  baseCourses: string[]
  discipline?: Discipline
  age?: number
  categoryId?: string
  courses: string[]
  firstName: string
  lastName: string
  member?: boolean
}

export type Booker = {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  zip: string
  city: string
}

export type FlowState = {
  /** Navigation stack, the last entry is the current step. */
  steps: StepId[]
  returnToSummary: boolean
  booker: Booker
  attendees: FlowAttendee[]
  draft: Draft
  /** Taken from the link the booker came with, kept across reloads. */
  discountCode?: string
}

export type FlowAction =
  | { type: 'chooseAttendee'; attendeeId: string | null }
  | { type: 'chooseDiscipline'; discipline: Discipline }
  | { type: 'setAge'; age: number }
  | { type: 'chooseCategory'; categoryId: string }
  | { type: 'setCourses'; courses: string[] }
  | { type: 'setAttendeeName'; firstName: string; lastName: string }
  | { type: 'setMembership'; member: boolean }
  | { type: 'addCourse' }
  | { type: 'finish' }
  | { type: 'setBookerName'; firstName: string; lastName: string }
  | { type: 'setEmail'; email: string }
  | { type: 'setPhone'; phone: string }
  | { type: 'setAddress'; address: string; zip: string; city: string }
  | { type: 'editContact'; step: ContactStepId }
  | { type: 'editAttendee'; attendeeId: string }
  | { type: 'removeCourse'; attendeeId: string; courseSlug: string }
  | { type: 'removeAttendee'; attendeeId: string }
  | { type: 'goto'; step: StepId }
  | { type: 'popTo'; depth: number }
  | { type: 'reset' }

/** Step order used for the progress bar. */
const progressOrder: StepId[] = [
  'discipline',
  'age',
  'skillLevel',
  'courses',
  'attendeeName',
  'membership',
  'next',
  'bookerLastName',
  'email',
  'phone',
  'address',
  'summary',
]

export const getProgress = (step: StepId) => {
  const index = progressOrder.indexOf(
    step === 'attendeeChoice' ? 'discipline' : step,
  )
  return (index + 1) / progressOrder.length
}

export const getCurrentStep = (state: FlowState) =>
  state.steps[state.steps.length - 1]

export const getMatchingCategories = <T extends CourseCategory>(
  categories: T[],
  discipline: Discipline | undefined,
  age: number | undefined,
) =>
  discipline === undefined || age === undefined
    ? []
    : categories.filter(
        (category) =>
          category.discipline === discipline &&
          category.minAge <= age &&
          category.maxAge >= age,
      )

const createId = () =>
  globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)

const createDraft = (): Draft => ({
  attendeeId: createId(),
  isNewAttendee: true,
  baseCourses: [],
  courses: [],
  firstName: '',
  lastName: '',
})

const draftFromAttendee = (attendee: FlowAttendee): Draft => ({
  attendeeId: attendee.id,
  isNewAttendee: false,
  baseCourses: attendee.courses,
  age: attendee.age,
  courses: [],
  firstName: attendee.firstName,
  lastName: attendee.lastName,
  member: attendee.member,
})

export const createInitialState = (): FlowState => ({
  steps: ['discipline'],
  returnToSummary: false,
  booker: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    zip: '',
    city: '',
  },
  attendees: [],
  draft: createDraft(),
})

const isContactComplete = ({ booker }: FlowState) =>
  [
    booker.lastName,
    booker.email,
    booker.phone,
    booker.address,
    booker.zip,
    booker.city,
  ].every(Boolean)

const push = (state: FlowState, step: StepId): FlowState => ({
  ...state,
  steps: [...state.steps, step],
})

/** Goes to the next step, or back to the summary when editing from there. */
const pushOrReturn = (state: FlowState, step: StepId): FlowState =>
  state.returnToSummary
    ? push({ ...state, returnToSummary: false }, 'summary')
    : push(state, step)

const updateDraft = (state: FlowState, draft: Partial<Draft>): FlowState => ({
  ...state,
  draft: { ...state.draft, ...draft },
})

/**
 * Writes the draft into the attendee list. Idempotent, so going back and
 * answering a step again updates the attendee instead of duplicating it.
 */
const commitDraft = (state: FlowState): FlowState => {
  const { draft } = state
  const courses = [...new Set([...draft.baseCourses, ...draft.courses])]
  const attendee: FlowAttendee = {
    id: draft.attendeeId,
    firstName: draft.firstName,
    lastName: draft.lastName,
    age: draft.age ?? 0,
    member: draft.member ?? false,
    courses,
  }
  const exists = state.attendees.some(({ id }) => id === attendee.id)

  if (courses.length === 0) {
    return {
      ...state,
      attendees: state.attendees.filter(({ id }) => id !== attendee.id),
    }
  }

  return {
    ...state,
    attendees: exists
      ? state.attendees.map((existing) =>
          existing.id === attendee.id ? attendee : existing,
        )
      : [...state.attendees, attendee],
  }
}

/** Continues once discipline and age are known, skipping a single skill level. */
const continueToSkillLevel = (
  state: FlowState,
  categories: CourseCategory[],
): FlowState => {
  const matches = getMatchingCategories(
    categories,
    state.draft.discipline,
    state.draft.age,
  )

  if (matches.length === 1) {
    const categoryId = matches[0].id
    const courses =
      categoryId === state.draft.categoryId ? state.draft.courses : []
    return push(updateDraft(state, { categoryId, courses }), 'courses')
  }

  const categoryStillMatches = matches.some(
    ({ id }) => id === state.draft.categoryId,
  )
  const nextState = categoryStillMatches
    ? state
    : updateDraft(state, { categoryId: undefined, courses: [] })

  return push(nextState, matches.length === 0 ? 'courses' : 'skillLevel')
}

const removeCourseFromDraft = (state: FlowState, courseSlug: string) =>
  updateDraft(state, {
    baseCourses: state.draft.baseCourses.filter((slug) => slug !== courseSlug),
    courses: state.draft.courses.filter((slug) => slug !== courseSlug),
  })

export const createFlowReducer =
  (categories: CourseCategory[]) =>
  (state: FlowState, action: FlowAction): FlowState => {
    switch (action.type) {
      case 'chooseAttendee': {
        const attendee = state.attendees.find(
          ({ id }) => id === action.attendeeId,
        )
        if (attendee) {
          return push(
            { ...state, draft: draftFromAttendee(attendee) },
            'discipline',
          )
        }
        const isUncommittedNewDraft =
          state.draft.isNewAttendee &&
          !state.attendees.some(({ id }) => id === state.draft.attendeeId)
        const draft = isUncommittedNewDraft ? state.draft : createDraft()
        return push({ ...state, draft }, 'discipline')
      }

      case 'chooseDiscipline': {
        const changed = action.discipline !== state.draft.discipline
        const nextState = updateDraft(
          state,
          changed
            ? {
                discipline: action.discipline,
                categoryId: undefined,
                courses: [],
              }
            : {},
        )
        return nextState.draft.isNewAttendee
          ? push(nextState, 'age')
          : continueToSkillLevel(nextState, categories)
      }

      case 'setAge':
        return continueToSkillLevel(
          updateDraft(state, { age: action.age }),
          categories,
        )

      case 'chooseCategory': {
        const changed = action.categoryId !== state.draft.categoryId
        return push(
          updateDraft(state, {
            categoryId: action.categoryId,
            courses: changed ? [] : state.draft.courses,
          }),
          'courses',
        )
      }

      case 'setCourses': {
        const nextState = updateDraft(state, { courses: action.courses })
        return nextState.draft.isNewAttendee
          ? push(nextState, 'attendeeName')
          : push(commitDraft(nextState), 'next')
      }

      case 'setAttendeeName':
        return push(
          updateDraft(state, {
            firstName: action.firstName,
            lastName: action.lastName,
          }),
          'membership',
        )

      case 'setMembership':
        return pushOrReturn(
          commitDraft(updateDraft(state, { member: action.member })),
          'next',
        )

      case 'addCourse':
        return push({ ...state, returnToSummary: false }, 'attendeeChoice')

      case 'finish':
        return push(
          state,
          isContactComplete(state) ? 'summary' : 'bookerLastName',
        )

      case 'setBookerName':
        return pushOrReturn(
          {
            ...state,
            booker: {
              ...state.booker,
              firstName: action.firstName,
              lastName: action.lastName,
            },
          },
          'email',
        )

      case 'setEmail':
        return pushOrReturn(
          { ...state, booker: { ...state.booker, email: action.email } },
          'phone',
        )

      case 'setPhone':
        return pushOrReturn(
          { ...state, booker: { ...state.booker, phone: action.phone } },
          'address',
        )

      case 'setAddress':
        return pushOrReturn(
          {
            ...state,
            booker: {
              ...state.booker,
              address: action.address,
              zip: action.zip,
              city: action.city,
            },
          },
          'summary',
        )

      case 'editContact':
        return push({ ...state, returnToSummary: true }, action.step)

      case 'editAttendee': {
        const attendee = state.attendees.find(
          ({ id }) => id === action.attendeeId,
        )
        if (!attendee) return state
        return push(
          {
            ...state,
            returnToSummary: true,
            draft: draftFromAttendee(attendee),
          },
          'attendeeName',
        )
      }

      case 'removeCourse': {
        const attendees = state.attendees
          .map((attendee) =>
            attendee.id === action.attendeeId
              ? {
                  ...attendee,
                  courses: attendee.courses.filter(
                    (slug) => slug !== action.courseSlug,
                  ),
                }
              : attendee,
          )
          .filter((attendee) => attendee.courses.length > 0)
        const nextState = { ...state, attendees }
        return state.draft.attendeeId === action.attendeeId
          ? removeCourseFromDraft(nextState, action.courseSlug)
          : nextState
      }

      case 'removeAttendee': {
        const nextState = {
          ...state,
          attendees: state.attendees.filter(
            ({ id }) => id !== action.attendeeId,
          ),
        }
        return state.draft.attendeeId === action.attendeeId
          ? { ...nextState, draft: createDraft() }
          : nextState
      }

      case 'goto':
        return push(state, action.step)

      case 'popTo':
        if (action.depth < 0 || action.depth >= state.steps.length - 1) {
          return state
        }
        return {
          ...state,
          returnToSummary: false,
          steps: state.steps.slice(0, action.depth + 1),
        }

      case 'reset':
        // The Discount Code came with the link, not with the discarded booking.
        return { ...createInitialState(), discountCode: state.discountCode }
    }
  }
