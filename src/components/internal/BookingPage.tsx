import { ConvexProvider, ConvexReactClient } from 'convex/react'
import BookingForm from '@/components/internal/BookingForm'

const convex = new ConvexReactClient(
  import.meta.env.PUBLIC_CONVEX_URL as string,
)

export default function BookingPage({ courses, courseCategories }) {
  return (
    <ConvexProvider client={convex}>
      <BookingForm courses={courses} courseCategories={courseCategories} />
    </ConvexProvider>
  )
}
