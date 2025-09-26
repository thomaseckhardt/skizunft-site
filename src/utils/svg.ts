import * as cheerio from 'cheerio'

export const getRemoteSvgDimensions = async (url?: string) => {
  if (!url) return undefined
  try {
    const response = await fetch(url)
    if (!response.ok)
      throw new Error(`Failed to fetch SVG: ${response.statusText}`)

    const data = await response.text()
    const $ = cheerio.load(data, { xmlMode: true })
    const svg = $('svg')

    const svgWidthAttr = svg.attr('width')
    const svgHeightAttr = svg.attr('height')

    let width =
      svgWidthAttr && !svgWidthAttr?.includes('%')
        ? parseInt(svgWidthAttr)
        : undefined
    let height =
      svgHeightAttr && !svgHeightAttr?.includes('%')
        ? parseInt(svgHeightAttr)
        : undefined

    // If width/height are not set, check the viewBox
    if (!width || !height) {
      const viewBox = svg.attr('viewBox')
      if (viewBox) {
        const [, , vbWidth, vbHeight] = viewBox.split(' ').map(parseFloat)
        if (!width) width = vbWidth
        if (!height) height = vbHeight
      }
    }

    return {
      width,
      height,
    }
  } catch (err) {
    console.error('Error fetching SVG:', err)
    return undefined
  }
}

export const checkIfSvg = (url: string | undefined) => {
  if (!url) return false
  return url ? url.endsWith('.svg') : false
}
