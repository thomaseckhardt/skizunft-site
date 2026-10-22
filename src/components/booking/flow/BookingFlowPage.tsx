import { ConvexProvider, ConvexReactClient } from 'convex/react'
import BookingFlow from './BookingFlow'
import type { Catalog } from './steps'

const convex = new ConvexReactClient(
  import.meta.env.PUBLIC_CONVEX_URL as string,
)

export default function BookingFlowPage(catalog: Catalog) {
  return (
    <ConvexProvider client={convex}>
      <BookingFlow {...catalog} />
    </ConvexProvider>
  )
}
