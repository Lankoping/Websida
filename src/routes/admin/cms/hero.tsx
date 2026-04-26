import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/cms/hero')({
  component: AdminCmsHeroStub,
})

function AdminCmsHeroStub() {
  if (typeof window !== 'undefined') window.location.href = '/'
  return null
}
