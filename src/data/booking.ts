import { fetchStories } from '@/storyblok/utils/fetchStories'

export const bookingClosedRedirect = '/buchung/geschlossen/'
export const bookingEnabled = import.meta.env.PUBLIC_BOOKING_ENABLED === 'true'
export const internalBookingKey = 'H7GFS8JHA91HFASLKWH7GFG'

const categoryOrder = ['Beginner', 'Junior_Champion', 'Champion']

const dateFormat = new Intl.DateTimeFormat('de-DE', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})
const dateShortFormat = new Intl.DateTimeFormat('de-DE', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
})
const currencyFormat = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
})

const Discipline = {
  Ski: 'Ski',
  Snowboard: 'Snowboard',
}

export const disciplines = {
  [Discipline.Ski]: {
    value: Discipline.Ski,
    label: 'Skikurs',
    description: 'Ab 4 Jahren',
    minAge: 4,
    maxAge: 99,
    enabled: true,
  },
  [Discipline.Snowboard]: {
    value: Discipline.Snowboard,
    label: 'Snowboardkurs',
    description: 'Für Kinder ab 6 bis einschließlich 13 Jahren',
    minAge: 6,
    maxAge: 13,
    enabled: false,
    // Shown in place of the description while the discipline is disabled.
    disabledMessage:
      'Die Termine für die Snowboardkurse stehen noch nicht fest. Schau bald wieder vorbei!',
  },
}

export async function loadBookingData() {
  const courseCategoryStories = await fetchStories({
    content_type: 'CourseCategory',
    per_page: 50,
  })
  const courseCategories = courseCategoryStories
    .map((story: any) => {
      const { price, priceMember, minAge, maxAge, ...storyContent } =
        story.content

      return {
        ...storyContent,
        price: parseFloat(price),
        priceMember: parseFloat(priceMember),
        priceFormatted: currencyFormat.format(price),
        priceMemberFormatted: currencyFormat.format(priceMember),
        minAge: parseInt(minAge),
        maxAge: parseInt(maxAge),
        id: story.uuid,
        slug: story.slug,
      }
    })
    .sort(
      (a: any, b: any) =>
        categoryOrder.indexOf(a.skillLevel) -
        categoryOrder.indexOf(b.skillLevel),
    )
  const courseCategoriesById = courseCategories.reduce(
    (acc: Record<string, any>, category: any) => {
      acc[category.id] = category
      return acc
    },
    {} as Record<string, any>,
  )

  const courseStories = await fetchStories({
    content_type: 'Course',
    per_page: 50,
    sort_by: 'content.startDate:asc',
  })
  const courses = courseStories.map((story: any) => {
    const startDate = new Date(`${story.content.startDate}+0000`)
    const endDate = new Date(`${story.content.endDate}+0000`)
    const {
      category: categoryId,
      closed = false,
      canceled = false,
      ...storyContent
    } = story.content

    return {
      canceled,
      closed,
      disabled: closed || canceled,
      state: undefined,
      stateColor: undefined,
      ...storyContent,
      catgeory: courseCategoriesById[categoryId],
      categoryId,
      id: story.uuid,
      name: story.name,
      slug: story.slug,
      startDate,
      endDate,
      dateFormatted: dateFormat.formatRange(startDate, endDate),
      dateShortFormatted: dateShortFormat.formatRange(startDate, endDate),
    }
  })

  return { courses, courseCategories, disciplines }
}
