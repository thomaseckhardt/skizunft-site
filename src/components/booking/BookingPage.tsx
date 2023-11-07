import { ConvexProvider, ConvexReactClient } from 'convex/react'
import BookingForm from './BookingForm'

const convex = new ConvexReactClient(
  import.meta.env.PUBLIC_CONVEX_URL as string,
)

export default function BookingPage({
  disciplines,
  courses,
  courseCategories,
}) {
  return (
    <ConvexProvider client={convex}>
      <BookingForm
        disciplines={disciplines}
        courses={courses}
        courseCategories={courseCategories}
      />
    </ConvexProvider>
  )
}
