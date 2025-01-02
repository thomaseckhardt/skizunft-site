import { defineMiddleware } from 'astro/middleware'

export const onRequest = defineMiddleware((context, next) => {
  if (!context.url.pathname.startsWith('/booking/admin')) {
    return next()
  }

  // If present, this will have the form: "Basic <credential>"
  const basicAuth = context.request.headers.get('authorization')

  if (basicAuth) {
    // get auth value from string "Basic authValue"
    const authValue = basicAuth.split(' ')[1]

    // decode the Base64 encoded string via atob (https://developer.mozilla.org/en-US/docs/Web/API/atob)
    const [user, pwd] = atob(authValue).split(':')

    console.log(user, pwd)

    if (user === 'kandel' && pwd === 'uawFZcPbbNQsMr@xqmhCMY*7') {
      // forward request
      return next()
    }
  }

  return new Response('Auth required', {
    status: 401,
    headers: {
      'WWW-authenticate': 'Basic realm="Secure Area"',
    },
  })
})
