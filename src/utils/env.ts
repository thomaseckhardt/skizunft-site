export const isDevelopment = () => {
  return import.meta.env.PUBLIC_ENV === 'development'
}

export const isPreview = () => {
  return import.meta.env.PUBLIC_ENV === 'preview'
}

export const isProduction = () => {
  return import.meta.env.PUBLIC_ENV === 'production'
}

export const isSSR = () => {
  return import.meta.env.SSR
}

export const getStoryblokVersion = (): 'published' | 'draft' => {
  return isProduction() ? 'published' : 'draft'
}
