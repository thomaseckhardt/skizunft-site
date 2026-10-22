import { defineMiddleware } from 'astro/middleware'

// The admin area only runs on a local dev server (`astro dev`).
export const onRequest = defineMiddleware((context, next) => {
  if (
    context.url.pathname.startsWith('/booking/admin') &&
    !import.meta.env.DEV
  ) {
    return new Response('Not found', { status: 404 })
  }

  return next()
})
