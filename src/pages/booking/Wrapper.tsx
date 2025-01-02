import { ConvexProvider, ConvexReactClient } from 'convex/react'
import ConfirmationAdmin from './ConfirmationAdmin'

export default function Wrapper({ courses, courseCategories }) {
  const convex = new ConvexReactClient(
    import.meta.env.PUBLIC_CONVEX_URL as string,
  )
  console.log(
    'import.meta.env.PUBLIC_CONVEX_URL',
    import.meta.env.PUBLIC_CONVEX_URL,
  )

  return (
    <ConvexProvider client={convex}>
      <ConfirmationAdmin
        courses={courses}
        courseCategories={courseCategories}
      />
    </ConvexProvider>
  )
}
