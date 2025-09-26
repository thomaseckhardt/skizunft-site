import { storyblokEditable, type SbBlokData } from '@storyblok/astro';

const editable = (blok: SbBlokData) => {
  return storyblokEditable(blok);
};

export { editable as storyblokEditable };
