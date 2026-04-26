import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/posts')({
  component: AdminPostsStub,
})

function AdminPostsStub() {
  if (typeof window !== 'undefined') window.location.href = '/'
  return null
}
