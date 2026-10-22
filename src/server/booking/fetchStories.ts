import StoryblokClient from 'storyblok-js-client'

const storyblok = new StoryblokClient({
  accessToken: import.meta.env.STORYBLOK_TOKEN,
  region: 'eu',
})

/**
 * Loads stories in API routes. The @storyblok/astro client is only set up
 * while a page renders (it is injected as a "page-ssr" script), so an
 * endpoint that runs first in a fresh function can't use it. Throws on
 * errors, unlike src/storyblok/utils/fetchStories.js.
 */
export async function fetchStoriesForEndpoint(query: Record<string, unknown>) {
  const { data } = await storyblok.get('cdn/stories', {
    version: import.meta.env.STORYBLOK_VERSION ?? 'published',
    ...query,
  })
  return data?.stories ?? []
}
