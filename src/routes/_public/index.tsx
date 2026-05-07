import { PublicHome } from '@/components/public-home'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/')({
  component: Index,
})

function Index() {
  return (
    <>
      <PublicHome />
    </>
  )
}
