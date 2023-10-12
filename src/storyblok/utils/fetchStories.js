import { useStoryblokApi } from '@storyblok/astro'

export async function fetchStories(query = {}) {
  const storyblokApi = useStoryblokApi()
  const storyblokEntryVersion = import.meta.env.STORYBLOK_VERSION ?? 'published'

  try {
    const { data } = await storyblokApi.get(`cdn/stories`, {
      version: storyblokEntryVersion,
      ...query,
    })
    return data?.stories ?? []
  } catch (error) {
    console.error(error)
    return error
  }
}
