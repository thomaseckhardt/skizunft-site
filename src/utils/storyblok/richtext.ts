import { renderRichText as sbRenderRichText } from '@storyblok/astro';
import uniqBy from 'lodash/uniqBy';
import type { StoryblokRichtext } from '@/types/storyblok';

const richTextFieldNames = ['richtext', 'text', 'content'];

export const renderRichText = (richtext: any) => {
  return sbRenderRichText(richtext);
};

export const richTextToPlainText = (html: string) => {
  return html.replace(/<[^>]+>/g, '');
};

export const isRichTextField = (field: any) => {
  if (field?.type !== 'doc') return false;
  if (!field?.content?.length) return false;
  if (
    field?.content?.length === 1 &&
    !field?.content?.[0]?.content &&
    field?.content?.[0]?.type !== 'blok'
  )
    return false;

  return true;
};

export const filterRichTextFields = (bloks = []): StoryblokRichtext[] => {
  const richTextFields = bloks.reduce((all, blok) => {
    Object.entries(blok).forEach(([key, value]) => {
      if (richTextFieldNames.includes(key))
        if (isRichTextField(value)) {
          all.push(value as StoryblokRichtext); // Type assertion added here
        }
    });
    return all;
  }, [] as StoryblokRichtext[]);

  return richTextFields;
};

export const filterHeadings = (bloks = []) => {
  const richTextFields = filterRichTextFields(bloks);
  const content = richTextFields.reduce((all, blok) => {
    return all.concat(blok.content as StoryblokRichtext[]);
  }, [] as StoryblokRichtext[]);
  const headings = content.filter((blok: any) => blok.type === 'heading');
  return headings;
};

export const filterLinks = (richtext: StoryblokRichtext) => {
  const traverse = (obj: any, collection: any[] = []) => {
    Object.entries(obj).forEach(([k, v]) => {
      if (k === 'marks' && Array.isArray(v)) {
        collection = [
          ...collection,
          ...v.filter((mark) => mark.type === 'link').map((link) => link.attrs),
        ];
      }
      if (v && typeof v === 'object') {
        collection = traverse(v, collection);
      }
    });
    return collection;
  };
  const foundLinks = traverse(richtext);

  const uniqueLinks = uniqBy(foundLinks, (link) => link.href);
  return uniqueLinks;
};
