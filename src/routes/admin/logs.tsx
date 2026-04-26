import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/logs')({
  component: AdminLogsStub,
})

function AdminLogsStub() {
  if (typeof window !== 'undefined') window.location.href = '/'
  return null
}
