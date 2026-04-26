import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/cms/sections')({
  component: AdminCmsSectionsStub,
})

function AdminCmsSectionsStub() {
  if (typeof window !== 'undefined') window.location.href = '/'
  return null
}
