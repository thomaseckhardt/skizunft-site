import type { StoryblokGlobal } from '@/types/storyblok';
import { fetchStories } from './stories';

export const useGlobalStory = async (slug: string, lang: string) => {
  const parent = slug.split('/')[0];

  const globalStories = await fetchStories({
    content_type: 'Global',
    starts_with: `${parent}/`,
    per_page: 1,
    language: lang,
  });

  const globalStory = (globalStories?.[0]?.content as StoryblokGlobal) ?? undefined;

  return globalStory;
};
