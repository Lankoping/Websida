import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/edit/$id')({
  component: AdminEditStub,
})

function AdminEditStub() {
  if (typeof window !== 'undefined') window.location.href = '/'
  return null
}
