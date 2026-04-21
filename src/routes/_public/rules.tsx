import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/rules')({
  component: Rules,
})

function Rules() {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Rules</h1>
      <div className="prose">Content coming soon.</div>
    </div>
  )
}
