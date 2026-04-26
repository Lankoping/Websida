import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/en/')({
  component: EnIndexStub,
})

function EnIndexStub() {
  if (typeof window !== 'undefined') window.location.href = '/'
  return null
}
