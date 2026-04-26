import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/cms')({
  component: AdminCmsStub,
})

function AdminCmsStub() {
  if (typeof window !== 'undefined') window.location.href = '/'
  return null
}
