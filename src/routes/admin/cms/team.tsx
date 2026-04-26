import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/cms/team')({
  component: AdminCmsTeamStub,
})

function AdminCmsTeamStub() {
  if (typeof window !== 'undefined') window.location.href = '/'
  return null
}
