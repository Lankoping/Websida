import { createFileRoute } from '@tanstack/react-router'
import { getPostsFn } from '../../server/functions/posts'

export const Route = createFileRoute('/blogs/')({
  loader: async () => {
    const posts = await getPostsFn({ data: 'blog' })
    return { posts }
  },
  component: BlogPostList,
})

function BlogPostList() {
  const { posts } = Route.useLoaderData()
  
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-black">Blogg</h1>
      <div className="grid gap-6">
        {posts.map((post) => (
          <a key={post.id} href={`/blogs/${post.slug}`} className="block bg-white border border-gray-200 p-6 rounded-lg shadow hover:shadow-md transition-shadow flex items-center gap-4">
            {post.type === 'LAN-PARTY' && <img src="/lan-party.svg" alt="LAN-PARTY" className="w-12 h-12" />}
            {post.type === 'GEMENSKAP' && <img src="/gemenskap.svg" alt="GEMENSKAP" className="w-12 h-12" />}
            <div>
              <h2 className="text-2xl font-bold mb-2 text-black">{post.title}</h2>
              <p className="text-gray-700">{post.excerpt}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
