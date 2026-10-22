import { ConvexHttpClient } from 'convex/browser'
import { requireServerEnv } from './env'

/**
 * Convex client of the local admin area. `pnpm admin` loads
 * ADMIN_CONVEX_URL (usually the production deployment) and ADMIN_API_SECRET
 * from a local env file.
 */
export function getAdminConvex() {
  return {
    convex: new ConvexHttpClient(requireServerEnv('ADMIN_CONVEX_URL')),
    secret: requireServerEnv('ADMIN_API_SECRET'),
  }
}
