import { NAMESPACE } from '@/constants';
import type { StoryblokMultilink } from '@/types/storyblok';
import { isProduction } from '@/utils/env';
import { addLeadingSlash, normalizePath } from '@/utils/url';

export type Link = StoryblokMultilink & { href?: string };

type LinkAttrs = {
  as?: string;
  type?: string;
  href?: string;
  target?: string;
  rel?: string;
  title?: string;
  isExternal?: boolean;
  isInternal?: boolean;
  isStory?: boolean;
  isAsset?: boolean;
  isMail?: boolean;
  [k: string]: any;
};

export const filterCustomAttrs = (link: Link) => {
  if (typeof link !== 'object' || link === null) return {};

  // List all known system/Storyblok properties to exclude
  const exclude = new Set([
    'uuid',
    'href',
    'anchor',
    'cached_url',
    'email',
    'id',
    'linktype',
    'fieldtype',
    'target',
    'prep',
    'url',
    'story',
    'rel',
    'title',
  ]);

  // Return only custom attributes
  return Object.fromEntries(Object.entries(link).filter(([key]) => !exclude.has(key)));
};

export const isValidLink = (link: Link | string | undefined) => {
  if (link === undefined) return false;
  if (typeof link === 'string') return true;
  return (link.linktype === 'story' && link.story) || (link.linktype !== 'story' && link.url);
};

export const isCurrentPage = (
  link: Link | string | undefined,
  pathname: string,
  exactMatch = false,
) => {
  const { href = '' } = addLinkAttrs(link) ?? {};
  if (!href || href === '/') return false;
  const match = exactMatch
    ? normalizePath(pathname) === normalizePath(href)
    : pathname.startsWith(href);
  return match;
};

export const getLinkUrl = (link: Link) => {
  if (typeof link === 'string') return link;

  const slug =
    link?.linktype === 'story' && link.story?.full_slug ? `/${link.story?.full_slug}` : undefined;

  return slug || link?.url || link?.cached_url || link?.href || '';
};

export const checkExternalUrl = (url: string) => {
  return /^https?:\/\//.test(url);
};

export const checkAssetUrl = (url: string) => {
  return /^https:\/\/a.storyblok.com/.test(url);
};

export const checkAssetLink = (link: Link) => {
  if (typeof link === 'string') {
    return checkAssetUrl(link);
  }
  return link.linktype === 'asset';
};

export const checkMailUrl = (url: string) => {
  return /^mailto:/.test(url);
};

export const checkMailLink = (link: Link | string) => {
  if (typeof link === 'string') {
    return checkMailUrl(link);
  }
  return link.linktype === 'email' || checkMailUrl(getLinkUrl(link));
};

export const checkStoryLink = (link: Link | string) => {
  if (typeof link === 'string') {
    return false;
  }
  return link?.linktype === 'story';
};

export const checkExternalLink = (link: Link | string) => {
  if (typeof link === 'string') {
    return checkExternalUrl(link);
  }
  return checkExternalUrl(getLinkUrl(link)) && (!link.linktype || link.linktype === 'url');
};

export const getInternalProductionUrl = (url: string) => {
  if (isProduction() === false) return url;
  let prodUrl = url;
  // const prodUrl = url.replace(/^\/?site\/?/, '/')
  //   .replace(new RegExp(`^/?${NAMESPACE}/?`), '/');
  return prodUrl;
};

export const addLinkAttrs = (
  linkOrUrl: Link | string | undefined,
  customAttrs: object = {},
  withInfo: boolean = false,
): LinkAttrs | undefined => {
  // Heads up: `resolve_links: 'url'
  // @see https://www.storyblok.com/docs/guide/in-depth/rendering-the-link-field

  if (!linkOrUrl) return undefined;

  const link = linkOrUrl as Link;

  if (
    linkOrUrl === undefined ||
    linkOrUrl === null ||
    linkOrUrl === '' ||
    (link.linktype === 'story' && link.id === '') ||
    (link.linktype === 'url' && link.cached_url === '' && link.url === '')
  ) {
    return withInfo
      ? {
          isExternal: false,
          isInternal: false,
          isStory: false,
          isOverlay: false,
        }
      : undefined;
  }

  if (link?.anchor === '') delete link.anchor;
  if (link?.rel === '') delete link.rel;
  if (link?.title === '') delete link.title;

  const isStory = checkStoryLink(link);
  const isExternal = checkExternalLink(link);
  const isAsset = checkAssetLink(link);
  const isMail = checkMailLink(link);
  const isInternal =
    (typeof linkOrUrl === 'string' && !isExternal && !isMail && !isAsset) || isStory;

  let url = typeof linkOrUrl === 'string' ? linkOrUrl : getLinkUrl(link);

  if (isStory || isInternal) {
    url = addLeadingSlash(normalizePath(url));
    if (isProduction()) {
      url = getInternalProductionUrl(url);
    }
    if (link?.anchor && typeof link?.anchor === 'string') {
      url += `#${link.anchor}`;
    }
  }

  if (isMail) {
    const email = link.href || link.url || link.email || url;
    if (email) {
      url = email.startsWith('mailto:') ? email : `mailto:${email}`;
    }
  }

  let attrs: LinkAttrs = {
    href: url,
    ...customAttrs,
    ...(link.target ? { target: link.target } : {}),
  };

  if (withInfo) {
    attrs = {
      ...attrs,
      isExternal,
      isInternal,
      isStory,
      isAsset,
      isMail,
    };
  }

  if ((isExternal || isAsset || isMail) && !attrs.target) {
    attrs['target'] = attrs.target ?? '_blank';
  }

  // Note:
  // - We filter all Storyblok specific attributes to get only the custom ones added by the editor
  // - The attribute `id` is a reserved name by Storyblok
  const customLinkAttrs = filterCustomAttrs(link);

  attrs = {
    ...customLinkAttrs,
    ...attrs,
    // Double check because Storyblok passes `rel` and `title` as blank strings by default
    rel: customLinkAttrs.rel !== '' ? (customLinkAttrs.rel as string) : undefined,
    title: customLinkAttrs.title !== '' ? (customLinkAttrs.title as string) : undefined,
  };

  if (isExternal && attrs.target === '_blank' && attrs.rel === undefined) {
    attrs['rel'] = attrs.rel ?? 'noopener noreferrer';
  }

  if (!attrs.as) {
    attrs['as'] = 'a';
  }

  if (!attrs.download && isAsset) {
    attrs['download'] = '';
  }

  return attrs;
};
