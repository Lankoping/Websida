import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/blogs/')({
  component: BlogsIndexStub,
})

function BlogsIndexStub() {
  if (typeof window !== 'undefined') window.location.href = '/'
  return null
}
