import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/example-protected-route')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Protected route example</div>
}
