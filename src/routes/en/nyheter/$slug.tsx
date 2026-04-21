import { createFileRoute } from '@tanstack/react-router'
import { getPostBySlugTranslatedToEnglishFn } from '../../../../server/functions/posts'
import { MarkdownContent } from '../../../../components/markdown-content'

export const Route = createFileRoute('/en/nyheter/$slug')({
  loader: async ({ params }) => {
    try {
      const post = await getPostBySlugTranslatedToEnglishFn({ data: params.slug })
      if (!post) {
        throw new Error('Post not found')
      }
      return { post }
    } catch (e) {
      throw new Error('Post not found')
    }
  },
  component: NewsPost,
})

function NewsPost() {
  const { post } = Route.useLoaderData()

  return (
    <div className="container mx-auto p-8 max-w-4xl bg-background text-foreground min-h-screen">
      <a href="/en/nyheter" className="text-primary hover:underline mb-8 block">← Back to News</a>
      <p className="text-xs text-muted-foreground mb-3 italic">* Translated from swedish to english using google translate</p>
      <h1 className="text-4xl font-bold mb-4 text-foreground">{post.title}</h1>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <span>{new Date(post.createdAt!).toLocaleDateString('en-GB')}</span>
        <span className="mx-2">•</span>
        <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs uppercase tracking-wider">{post.type}</span>
      </div>
      <div className="prose prose-slate max-w-none">
        <MarkdownContent content={post.content} />
      </div>
    </div>
  )
}
