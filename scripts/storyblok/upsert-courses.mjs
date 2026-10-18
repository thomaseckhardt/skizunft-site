/**
 * Create or update Storyblok `Course` stories from a CSV file.
 *
 * Course stories are reused across seasons and matched by slug inside the
 * `kurse/` folder: existing stories get the new dates, seat limit and a reset
 * booking state; missing ones are created.
 *
 * CSV columns: name,slug,category,startDate,endDate,seatLimit
 *   - category: slug of a CourseCategory story in `kurs-kategorien/`
 *   - startDate/endDate: YYYY-MM-DD
 *
 * Usage:
 *   npm run sb:courses -- doc/kurstermine-2026-2027.csv            # dry run
 *   npm run sb:courses -- doc/kurstermine-2026-2027.csv --apply    # save as draft
 *   ... --apply --publish          # save and publish
 *   ... --apply --cancel-missing   # also mark courses not in the CSV as canceled
 *
 * Requires STORYBLOK_MANAGEMENT_TOKEN (personal access token) in .env.local.
 */
import { readFile } from 'node:fs/promises'

const API = 'https://mapi.storyblok.com/v1'
const COURSE_FOLDER = 'kurse'
const CATEGORY_FOLDER = 'kurs-kategorien'

const args = process.argv.slice(2)
const csvPath = args.find((arg) => !arg.startsWith('--'))
const apply = args.includes('--apply')
const publish = args.includes('--publish')
const cancelMissing = args.includes('--cancel-missing')

const token = process.env.STORYBLOK_MANAGEMENT_TOKEN
const spaceId = process.env.STORYBLOK_SPACE || '256004'

if (!csvPath) fail('Missing CSV path argument.')
if (!token) fail('Missing STORYBLOK_MANAGEMENT_TOKEN in environment.')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function fail(message) {
  console.error(`✖ ${message}`)
  process.exit(1)
}

async function api(path, { method = 'GET', body } = {}, attempt = 1) {
  // Management API rate limit is ~3 requests per second
  await sleep(350)
  const response = await fetch(`${API}/spaces/${spaceId}${path}`, {
    method,
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (response.status === 429 && attempt <= 5) {
    await sleep(1000 * attempt)
    return api(path, { method, body }, attempt + 1)
  }
  if (!response.ok) {
    throw new Error(
      `${method} ${path} → ${response.status} ${await response.text()}`,
    )
  }
  return response.json()
}

async function listStories(params) {
  const query = new URLSearchParams({ per_page: '100', ...params })
  const { stories } = await api(`/stories?${query}`)
  return stories.filter((story) => !story.is_folder)
}

function parseCsv(text) {
  const [header, ...lines] = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  const keys = header.split(',').map((key) => key.trim())
  return lines.map((line, index) => {
    const values = line.split(',').map((value) => value.trim())
    if (values.length !== keys.length) {
      fail(
        `CSV line ${index + 2} has ${values.length} columns, expected ${keys.length}.`,
      )
    }
    return Object.fromEntries(keys.map((key, i) => [key, values[i]]))
  })
}

function validateRow(row, index) {
  const line = index + 2
  const datePattern = /^\d{4}-\d{2}-\d{2}$/
  if (!row.name || !row.slug)
    fail(`CSV line ${line}: name and slug are required.`)
  if (!datePattern.test(row.startDate) || !datePattern.test(row.endDate)) {
    fail(`CSV line ${line}: dates must be YYYY-MM-DD.`)
  }
  if (row.endDate < row.startDate)
    fail(`CSV line ${line}: endDate is before startDate.`)
  if (!/^\d+$/.test(row.seatLimit))
    fail(`CSV line ${line}: seatLimit must be a number.`)
}

const rows = parseCsv(await readFile(csvPath, 'utf8'))
rows.forEach(validateRow)

const duplicateSlugs = rows
  .map((row) => row.slug)
  .filter((slug, i, slugs) => slugs.indexOf(slug) !== i)
if (duplicateSlugs.length)
  fail(`Duplicate slugs in CSV: ${duplicateSlugs.join(', ')}`)

console.log(
  `${apply ? 'APPLY' : 'DRY RUN'}${apply && publish ? ' + PUBLISH' : ''} · space ${spaceId} · ${rows.length} courses from ${csvPath}\n`,
)

const query = new URLSearchParams({ folder_only: '1', per_page: '100' })
const { stories: folders } = await api(`/stories?${query}`)
const courseFolder = folders.find(
  (folder) => folder.full_slug.replace(/\/$/, '') === COURSE_FOLDER,
)
if (!courseFolder) fail(`Folder "${COURSE_FOLDER}" not found.`)

const categoryStories = await listStories({
  starts_with: `${CATEGORY_FOLDER}/`,
})
const categoryUuidBySlug = Object.fromEntries(
  categoryStories.map((story) => [story.slug, story.uuid]),
)

const courseStories = await listStories({
  starts_with: `${COURSE_FOLDER}/`,
})
const courseBySlug = Object.fromEntries(
  courseStories.map((story) => [story.slug, story]),
)

for (const row of rows) {
  const categoryUuid = categoryUuidBySlug[row.category]
  if (!categoryUuid) {
    fail(
      `Unknown category "${row.category}" for ${row.slug}. Known: ${Object.keys(categoryUuidBySlug).join(', ')}`,
    )
  }

  const courseContent = {
    category: categoryUuid,
    startDate: `${row.startDate} 00:00`,
    endDate: `${row.endDate} 00:00`,
    seatLimit: row.seatLimit,
    // Reset booking state for the new season
    closed: false,
    canceled: false,
    state: 'open',
    bookingStateColor: 'grey',
    bookingStateMessage: '',
  }
  const summary = `${row.name.padEnd(24)} ${row.startDate} – ${row.endDate} · ${row.seatLimit} Plätze`
  const existing = courseBySlug[row.slug]

  if (existing) {
    console.log(`↻ update  ${summary}`)
    if (!apply) continue
    const { story } = await api(`/stories/${existing.id}`)
    await api(`/stories/${existing.id}`, {
      method: 'PUT',
      body: {
        story: {
          ...story,
          name: row.name,
          content: { ...story.content, ...courseContent },
        },
        ...(publish && { publish: 1 }),
      },
    })
  } else {
    console.log(`+ create  ${summary}`)
    if (!apply) continue
    await api('/stories', {
      method: 'POST',
      body: {
        story: {
          name: row.name,
          slug: row.slug,
          parent_id: courseFolder.id,
          content: { component: 'Course', ...courseContent },
        },
        ...(publish && { publish: 1 }),
      },
    })
  }
}

const csvSlugs = new Set(rows.map((row) => row.slug))
const missing = courseStories.filter((story) => !csvSlugs.has(story.slug))

if (missing.length) {
  console.log(
    `\nNot in CSV (${cancelMissing ? 'will be marked as canceled' : 'unchanged, use --cancel-missing to close them'}):`,
  )
  for (const existing of missing) {
    console.log(
      `  ${cancelMissing ? '✕ cancel' : '· keep  '}  ${existing.name}`,
    )
    if (!apply || !cancelMissing) continue
    const { story } = await api(`/stories/${existing.id}`)
    await api(`/stories/${existing.id}`, {
      method: 'PUT',
      body: {
        story: { ...story, content: { ...story.content, canceled: true } },
        ...(publish && { publish: 1 }),
      },
    })
  }
}

console.log(
  apply
    ? `\n✔ Done${publish ? '' : ' (saved as draft, publish in Storyblok)'}.`
    : '\nDry run only. Re-run with --apply to write changes.',
)
