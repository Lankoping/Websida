import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/team')({
  component: Team,
})

function Team() {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Our Team</h1>
      <div className="grid gap-6">
        <p>Our team page is currently being updated.</p>
      </div>
    </div>
  )
}
