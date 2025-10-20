import { ConvexProvider, ConvexReactClient } from 'convex/react'
import BookingForm from './BookingForm'

const convexURL = import.meta.env.PUBLIC_CONVEX_URL as string

const convex = new ConvexReactClient(convexURL)

console.log('BookingPage using Convex URL:', convexURL)

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
