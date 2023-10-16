// Metrics
//
// According to a speed-reading test sponsored by Staples as part of an e-book
// promotion, here are the typical speeds at which humans read, and in theory
// comprehend, at various stages of educational development:
//
// words per minute
// 150 => Third-grade students
// 250 => Eighth grade students
// 450 => Average college student
// 575 => Average "high-level exec"
// 675 => Average college professor
// 1.500 => Speed readers
// 4.700 => World speed reading champion
// 300 => Average adult

export const readingTime = (text: string) => {
  const wpm = 250
  const words = text.trim().split(/\s+/).length
  const minutes = Math.ceil(words / wpm)
  return minutes
}
