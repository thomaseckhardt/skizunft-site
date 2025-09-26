import type { Props as SeoMeta } from 'astro-seo';
import { getInternalProductionUrl } from '@/utils/link';
import { getShareImageSrc } from './asset';

export type { SeoMeta };

type StoryblokSeoPlugin = {
  _uid?: string;
  title?: string;
  plugin?: string;
  og_image?: string;
  og_title?: string;
  description?: string;
  twitter_image?: string;
  twitter_title?: string;
  og_description?: string;
  twitter_description?: string;
  [k: string]: any;
};

export function toAstroSeo({
  siteUrl,
  story,
  config,
}: {
  siteUrl: string;
  story: {
    full_slug: string;
    content: {
      title?: string;
      abstract?: string;
      component?: string;
      seo?: StoryblokSeoPlugin;
      canonical?: string;
      noindex?: boolean;
      nofollow?: boolean;
    };
  };
  config?: { fallbackTitle?: string };
}): SeoMeta | undefined {
  const storyContent = story?.content;
  if (!storyContent) return undefined;

  const seo = {
    ...storyContent.seo,
    canonical: storyContent.canonical,
  };
  if (!seo.title) seo.title = storyContent.title;
  if (!seo.description) seo.description = storyContent.abstract;
  if (!seo.canonical) {
    seo.canonical = siteUrl + getInternalProductionUrl(story.full_slug);
  }

  if (!seo.og_title) seo.og_title = seo.title;
  if (!seo.og_description) seo.og_description = seo.description;

  const openGraph =
    seo.og_title && seo.og_image
      ? {
          basic: {
            title: seo.og_title,
            type: 'website',
            image: getShareImageSrc(seo.og_image),
            url: seo.canonical,
          },
          optional: {
            description: seo.og_description,
          },
        }
      : undefined;

  const meta: SeoMeta = {
    title: seo.title || config?.fallbackTitle,
    description: seo.description,
    canonical: seo.canonical,
    openGraph,
    twitter: {
      title: seo.twitter_title,
      description: seo.twitter_description,
      image: seo.twitter_image,
      card: 'summary_large_image',
    },
    nofollow: story.content?.nofollow,
    noindex: story.content?.noindex,
  };

  return meta;
}
