import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/cms/settings')({
  component: AdminCmsSettingsStub,
})

function AdminCmsSettingsStub() {
  if (typeof window !== 'undefined') window.location.href = '/'
  return null
}
