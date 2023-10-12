import isString from 'lodash/isString'
import isNumber from 'lodash/isNumber'

export const getAssetBasename = (url, extension) => {
  if (!isString(url)) return url
  const basename = url.substring(url.lastIndexOf('/') + 1)
  const dotExtension = extension && !extension.startsWith('.') ? `.${extension}` : extension
  const filename = dotExtension ? basename.replace(dotExtension, '') : basename
  return filename
}

export const getExtension = (url) => {
  return isString(url) ? url.substring(url.lastIndexOf('.') + 1) : url
}

export const getAssetExtension = (asset) => {
  const { url } = asset || {}
  return getExtension(url)
}

export const getAssetDimensionsFromFilename = (filename) => {
  if (!filename) return {}

  const urlSegments = filename.split('/')
  const dimensionsUrlSegment = urlSegments.length >= 5 ? urlSegments[5] : '0x0'
  const [width, height] = dimensionsUrlSegment.split('x')
  return {
    width: parseInt(width),
    height: parseInt(height),
    aspectRatio: width / height,
    aspectRatioInverse: height / width,
  }
}

export const getAsseWidthFromFilename = (filename) => {
  const { width } = getAssetDimensionsFromFilename(filename)
  return width
}

export const getAsseHeightFromFilename = (filename) => {
  const { height } = getAssetDimensionsFromFilename(filename)
  return height
}

export const getAssetDimensions = (asset) => {
  const filename = asset?.filename
  if (!filename) return []
  return getAssetDimensionsFromFilename(filename)
}
export const getAssetAspectRatioCssObject = (asset) => {
  const { width, height } = getAssetDimensions(asset)

  return { aspectRatio: `${width} / ${height}` }
}

export const getAssetAspectRatioViewBox = (asset) => {
  const { width, height } = getAssetDimensions(asset)

  return `0 0 ${width} ${height}`
}

export const getAssetAspectRatioPadding = (filename) => {
  const ratio = getAssetAspectRatioFactor(filename)
  return Math.round((1 / ratio) * 1000000) / 10000
}

export const getAssetAspectRatioFactor = (filename) => {
  const { width, height } = getAssetDimensions(filename)

  if (isNumber(width) && isNumber(height) && height > 0) {
    return width / height
  } else {
    return 1
  }
}

export const checkStoryblokImage = (imageObj) => {
  if (typeof imageObj !== 'object') return false
  return imageObj?.filename?.includes('https://a.storyblok.com/')
}
