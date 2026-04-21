import { createFileRoute } from '@tanstack/react-router'
import { getPageBySlugFn } from '../../server/functions/posts'

export const Route = createFileRoute('/_public/privacy')({
  loader: async () => {
    try {
      const page = await getPageBySlugFn({ data: 'privacy' })
      return { page }
    } catch {
      return { page: null }
    }
  },
  component: Privacy,
})

function Privacy() {
  const { page } = Route.useLoaderData()
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">{page?.title || 'Privacy Policy'}</h1>
      <div className="prose">{page?.content || 'Content coming soon.'}</div>
    </div>
  )
}
