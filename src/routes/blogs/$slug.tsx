import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { getPostBySlugFn } from '../../server/functions/posts'
import { MarkdownContent } from '../../components/markdown-content'

export const Route = createFileRoute('/blogs/$slug')({
  loader: async ({ params }) => {
    try {
      const post = await getPostBySlugFn({ data: params.slug })
      if (!post) {
        throw new Error('Post not found')
      }
      return { post }
    } catch (e) {
      throw new Error('Post not found')
    }
  },
  component: BlogPost,
})

function BlogPost() {
  const { post } = Route.useLoaderData()
  const navigate = useNavigate()

  return (
    <div className="container mx-auto p-8 max-w-4xl bg-white text-black min-h-screen">
      <button onClick={() => navigate({ to: '/blogs' })} className="text-black hover:underline mb-8 block">← Tillbaka</button>
      <h1 className="text-4xl font-bold mb-4 text-black">{post.title}</h1>
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
        <span>{new Date(post.createdAt!).toLocaleDateString()}</span>
        <span className="mx-2">•</span>
        <span className="bg-black text-white px-2 py-0.5 rounded text-xs uppercase tracking-wider">{post.type}</span>
      </div>
      <div className="prose prose-black max-w-none">
        <MarkdownContent content={post.content} />
      </div>
    </div>
  )
}
