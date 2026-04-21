import { createFileRoute } from '@tanstack/react-router'
import { getTeamMembersFn } from '../../server/functions/posts'

export const Route = createFileRoute('/_public/team')({
  loader: async () => {
    try {
      const members = await getTeamMembersFn()
      return { members }
    } catch {
      return { members: [] }
    }
  },
  component: Team,
})

function Team() {
  const { members } = Route.useLoaderData()
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Our Team</h1>
      <div className="grid gap-6">
        {members.map((m: any) => (
          <div key={m.id} className="border p-4 rounded">
            <h2 className="font-bold text-xl">{m.name}</h2>
            <p>{m.role}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
