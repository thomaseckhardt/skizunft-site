import { renderRichText as sbRenderRichText } from '@storyblok/astro'
import { readingTime } from '@/utils/readingTime'

export const renderRichText = (richtext) => {
  return sbRenderRichText(richtext)
}

export const richTextToPlainText = (html) => {
  return html.replace(/<[^>]+>/g, '')
}

export const storyblokRichTextReadingTime = (richtext: string | JSON) => {
  const plainText =
    typeof richtext === 'string'
      ? richtext
      : richTextToPlainText(renderRichText(richtext))
  return readingTime(plainText)
}
