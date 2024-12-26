import { fetchStories } from '@/storyblok/utils'
import { dateFormat, dateShortFormat } from '@/utils'

const courseStories = await fetchStories({
  content_type: 'Course',
  per_page: 50,
  sort_by: 'content.startDate:asc',
  resolve_relations: 'Course.category',
})
const courseDates = courseStories.map((story) => {
  const startDate = new Date(`${story.content.startDate}+0000`)
  const endDate = new Date(`${story.content.endDate}+0000`)
  const { closed = false, canceled = false, ...storyContent } = story.content

  return {
    canceled,
    closed,
    disabled: closed || canceled,
    state: undefined,
    stateColor: undefined,
    ...storyContent,
    id: story.uuid,
    name: story.name,
    slug: story.slug,
    startDate,
    endDate,
    dateFormatted: dateFormat.formatRange(startDate, endDate),
    dateShortFormatted: dateShortFormat.formatRange(startDate, endDate),
  }
})

export const courseBambini = {
  title: 'Skikurs Bambini',
  age: 'zwischen 4 und 5 Jahren',
  description: `<p>Der Skikurs für die Kleinsten. Hier lernen die Kinder spielerisch das Skifahren.</p>`,
  duration: '10.30 Uhr – 12 Uhr',
  meetingPointTitle: 'Treffpunkt 2',
  meetingPoint: 'Hinterer Parkplatz',
  dates: courseDates.filter(
    (course) => course.category?.slug === 'ski-bambini',
  ),
}

export const courseBeginner = {
  title: 'Skikurs Beginner',
  age: 'zwischen 6 und 13 Jahren',
  description: `<p>Unser Beginner Kurs richtet sich an Kinder, …</p><ul><li>die bisher noch keine Erfahrungen mit dem Skifahren gemacht haben.</li><li>die am Tag des Kurses zum ersten Mal auf dem Ski stehen.</li><li>die Spaß daran haben, sich im Schnee zu bewegen.</li></ul><p>Im Beginner Kurs lernt das Kind</p><ul><li>Sich sicher auf dem Ski zu bewegen</li><li>Punktuell und sicher zu bremsen.</li><li>Die ersten Pflugkurven im flachen Gelände zu fahren.</li></ul>`,
  duration: '10 – 12 Uhr und 13 – 15 Uhr',
  meetingPointTitle: 'Treffpunkt 2',
  meetingPoint: 'Hinterer Parkplatz',
  dates: courseDates.filter(
    (course) => course.category?.slug === 'ski-beginner',
  ),
}

export const courseJuniorChampion = {
  title: 'Skikurs Junior Champion',
  age: 'zwischen 6 und 13 Jahren',
  description: `<p>Unser Junior Champion Kurs richtet sich an Kinder,</p><ul><li>die sich bereits sicher auf dem Ski (fort)bewegen können.</li><li>die bremsen können.</li><li>für die aneinanderhängende Pflugkurven im flachen Gelände kein Problem sind.</li></ul><p>Im Junior Champion Kurs lernt das Kind</p><ul><li>Zu liften.</li><li>Kurven in paralleler Skistellung zu fahren.</li><li>In unterschiedlichen Hangneigungen parallel Ski zufahren.</li></ul>`,
  duration: '10 – 12 Uhr und 13 – 15 Uhr',
  meetingPointTitle: 'Treffpunkt 1',
  meetingPoint: 'Berggasthaus Kandelhof',
  dates: courseDates.filter(
    (course) => course.category?.slug === 'ski-junior-champion',
  ),
}

export const courseChampion = {
  title: 'Skikurs Champion',
  age: 'zwischen 6 und 13 Jahren',
  description: `<p>Unser Champion Kurs richtet sich an Kinder,</p><ul><li>die sicher liften können.</li><li>die Kurven überwiegend mit einer parallelen Skistellung fahren.</li><li>die sicher an unterschiedlichen Hangneigungen bremsen können.</li><li>die einen längeren Pistenabschnitt am Stück, ohne Pausen fahren können.</li><li>die sich beim Fahren in unterschiedlichen Hangneigungen sicher fühlen.</li></ul><p>Im Champion Kurs lernt das Kind</p><ul><li>In unterschiedlichen Geländeformen sicher zu fahren.</li><li>Durch den gezielten Einsatz komplexer Übungsformen, variabel Ski zu fahren.</li><li>Den Ski sportlich auf der Kante zu fahren (Carving).</li></ul>`,
  duration: '10 – 12 Uhr und 13 – 15 Uhr',
  meetingPointTitle: 'Treffpunkt 1',
  meetingPoint: 'Berggasthaus Kandelhof',
  dates: courseDates.filter(
    (course) => course.category?.slug === 'ski-champion',
  ),
}

export const courseJugendlicheErwachsene = {
  title: 'Skikurs Jugendliche und Erwachsene',
  age: 'ab 14 Jahren',
  description: `<p>Unser Beginner Kurs richtet sich an Jugendliche und Erwachasene, …</p><ul><li>die bisher noch keine Erfahrungen mit dem Skifahren gemacht haben.</li><li>die am Tag des Kurses zum ersten Mal auf dem Ski stehen.</li><li>die Spaß daran haben, sich im Schnee zu bewegen.</li></ul>`,
  duration: '10 – 12 Uhr und 13 – 15 Uhr',
  meetingPointTitle: 'Treffpunkt 1',
  meetingPoint: 'Berggasthaus Kandelhof',
  dates: courseDates.filter(
    (course) => course.category?.slug === 'ski-erwachsene',
  ),
}

export const courseSnowboard = {
  title: 'Snowboardkurs',
  age: 'zwischen 6 und 13 Jahren',
  description: `<p>Unser Snowboardkurs richtet sich an Kinder, die bisher noch keine Erfahrungen mit dem Snowboarden gemacht haben.</p>`,
  duration: '10 – 12 Uhr und 13 – 15 Uhr',
  meetingPointTitle: 'Treffpunkt 1',
  meetingPoint: 'Berggasthaus Kandelhof',
  dates: courseDates.filter((course) => course.category?.slug === 'snowboard'),
}

export const courses = [
  courseBambini,
  courseBeginner,
  courseJuniorChampion,
  courseChampion,
  courseJugendlicheErwachsene,
  courseSnowboard,
]
