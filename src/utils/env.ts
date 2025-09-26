import { MODE } from 'astro:env/client';
import { STORYBLOK_VERSION } from 'astro:env/server';

export const getMode = () => {
  return MODE ?? 'development';
};

export const isDevelopment = () => {
  return MODE === 'development' || MODE === undefined;
};
export const isProduction = () => {
  return MODE === 'production';
};

export const isPreview = () => {
  return MODE === 'preview';
};

export const isStaging = () => {
  return MODE === 'staging';
};

export const getStoryblokVersion = (): 'published' | 'draft' => {
  return STORYBLOK_VERSION;
};
