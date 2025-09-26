import type { StoryblokAsset } from '@/types/storyblok'
import isString from 'lodash/isString'
import type { StoryblokOperations } from 'unpic/providers/storyblok'

export const createStoryblokAsset = (url: string): StoryblokAsset => {
  return {
    id: 10000000000001,
    alt: '',
    name: '',
    focus: '',
    title: '',
    source: '',
    filename: url,
    copyright: '',
    fieldtype: 'asset',
    meta_data: {},
    is_external_url: false,

    is_private: false,
    src: url,
    updated_at: '',
    width: null,
    height: null,
    aspect_ratio: null,
    public_id: null,
    content_type: '',
  }
}

export const getAssetBasename = (url: string, extension: string) => {
  if (!isString(url)) return url
  const basename = url.substring(url.lastIndexOf('/') + 1)
  const dotExtension =
    extension && !extension.startsWith('.') ? `.${extension}` : extension
  const filename = dotExtension ? basename.replace(dotExtension, '') : basename
  return filename
}

export const getExtension = (url: string, { withoutDot = false }) => {
  if (typeof url !== 'string') return
  let ext = url.toLowerCase().substring(url.lastIndexOf('.') + 1)
  if (!withoutDot) ext = '.' + ext

  ext = ext.replace(/jpeg/, 'jpg')

  return ext
}

export const getAssetExtension = (asset: any, { withoutDot = false }) => {
  if (!asset.filename) return

  return getExtension(asset.filename, { withoutDot })
}

export const getAssetDimensionsFromFilename = (filename: string) => {
  if (!filename) return {}

  const urlSegments = filename.split('/')
  const dimensionsUrlSegment = urlSegments.length >= 5 ? urlSegments[5] : '0x0'
  const [width, height] = dimensionsUrlSegment
    .split('x')
    .map((d) => parseInt(d))
  const fromFilename = {
    width: width,
    height: height,
    aspectRatio: width / height,
    aspectRatioInverse: height / width,
  }

  return {
    fromFilename,
    width: fromFilename.width,
    height: fromFilename.height,
    aspectRatio: fromFilename.aspectRatio,
    aspectRatioInverse: fromFilename.aspectRatioInverse,
  }
}

export const getAsseWidthFromFilename = (filename: string) => {
  const { width } = getAssetDimensionsFromFilename(filename)
  return width
}

export const getAsseHeightFromFilename = (filename: string) => {
  const { height } = getAssetDimensionsFromFilename(filename)
  return height
}

export const getAssetDimensions = (asset: any) => {
  if (!asset?.filename) return undefined

  const fromFilename = getAssetDimensionsFromFilename(asset?.filename)
  const metaWidth = parseInt(asset?.meta_data?.width)
  const metaHeight = parseInt(asset?.meta_data?.height)
  const fromMeta =
    isNaN(metaWidth) || isNaN(metaHeight)
      ? {}
      : {
          width: metaWidth,
          height: metaHeight,
          aspectRatio: metaWidth / metaHeight,
          aspectRatioInverse: metaHeight / metaWidth,
        }

  const consolidated = {
    ...fromFilename,
    ...fromMeta,
    fromMeta,
  }
  return consolidated
}

export const checkStoryblokImage = (imageObj: any) => {
  if (typeof imageObj !== 'object') return false
  return imageObj?.filename?.includes('https://a.storyblok.com/')
}

export const isValidImage = (image: StoryblokAsset | undefined) => {
  if (image?.filename) return true
  return false
}

export const getValidImage = (image: StoryblokAsset) => {
  if (image?.filename) return image
  return undefined
}

// Storyblok focus string like 0x0:1x1
export const getFocusObjectPosition = ({
  focus,
  width,
  height,
}: {
  focus: string
  width: string | number
  height: string | number
}) => {
  if (!focus || !width || !height) return undefined

  const originalWidth = parseInt(width.toString())
  const originalHeight = parseInt(height.toString())

  const focusPoints = focus.split(':').map((coords) => {
    const [x, y] = coords.split('x')
    return { x: parseInt(x), y: parseInt(y) }
  })
  const center = {
    x: Math.round((focusPoints[1].x - focusPoints[0].x) / 2 + focusPoints[0].x),
    y: Math.round((focusPoints[1].y - focusPoints[0].y) / 2 + focusPoints[0].y),
  }

  const focusPosition = {
    x: ((center.x / (originalWidth ?? 1)) * 100).toFixed(4) + '%',
    y: ((center.y / (originalHeight ?? 1)) * 100).toFixed(4) + '%',
  }

  const objectPosition = `${focusPosition.x} ${focusPosition.y}`
  return objectPosition
}

export const getTransformOperations = ({
  image,
  operations = {},
}: {
  image: StoryblokAsset
  operations?: StoryblokOperations
}) => {
  // @see https://unpic.pics/providers/storyblok/
  const storyblokFilters: Record<string, string> = {
    ...operations?.filters,
  }
  if (image?.focus) {
    storyblokFilters.focal = image.focus
  }
  const finalOperations: StoryblokOperations = {
    ...operations,
    filters: storyblokFilters,
  }

  return finalOperations
}

export const getShareImageSrc = (storyblokImageSrc: string) => {
  const url = storyblokImageSrc + '/m/1200x630/filters:format(webp)'
  return url
}
