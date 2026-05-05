import { createFileRoute } from '@tanstack/react-router'
import { ComingSoon } from '@/components/coming-soon'

export const Route = createFileRoute('/en/')({
  component: EnIndex,
})

function EnIndex() {
  return <ComingSoon language="en" />
}
