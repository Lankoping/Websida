import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/datapolicy')({
  component: DatapolicyStub,
})

function DatapolicyStub() {
  if (typeof window !== 'undefined') window.location.href = '/'
  return null
}
