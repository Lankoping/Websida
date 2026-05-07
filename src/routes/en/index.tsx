import { createFileRoute } from '@tanstack/react-router'
import { PublicHome } from '@/components/public-home'

export const Route = createFileRoute('/en/')({
  component: EnIndex,
})

function EnIndex() {
  return <PublicHome language="en" />
}
