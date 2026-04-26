import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/new')({
  component: AdminNewStub,
})

function AdminNewStub() {
  if (typeof window !== 'undefined') window.location.href = '/'
  return null
}
