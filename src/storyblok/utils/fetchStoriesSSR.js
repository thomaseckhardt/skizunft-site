import StoryblokClient from "storyblok-js-client";

const Storyblok = new StoryblokClient({
  accessToken: Netlify.env.get("STORYBLOK_TOKEN"),
});

export async function fetchStoriesSSR(query = {}) {
  const storyblokEntryVersion = Netlify.env.get('STORYBLOK_VERSION') ?? 'published'

  try {
    const { data } = await Storyblok.get(`cdn/stories`, {
      version: storyblokEntryVersion,
      ...query,
    })
    return data?.stories ?? []
  } catch (error) {
    console.error(error)
    return error
  }
}
