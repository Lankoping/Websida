import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/blogs/$slug')({
  component: BlogSlugStub,
})

function BlogSlugStub() {
  if (typeof window !== 'undefined') window.location.href = '/blogs'
  return null
}
