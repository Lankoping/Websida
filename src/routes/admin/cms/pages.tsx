import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/cms/pages')({
  component: AdminCmsPagesStub,
})

function AdminCmsPagesStub() {
  if (typeof window !== 'undefined') window.location.href = '/'
  return null
}
