import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/cms/navigation')({
  component: AdminCmsNavigationStub,
})

function AdminCmsNavigationStub() {
  if (typeof window !== 'undefined') window.location.href = '/'
  return null
}
