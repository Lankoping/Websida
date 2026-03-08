import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { getPostByIdFn, updatePostFn } from '../../../server/functions/posts'
import { getSessionFn } from '../../../server/functions/auth'

export const Route = createFileRoute('/admin/edit/$id')({
  beforeLoad: async () => {
    const user = await getSessionFn()
    return { user }
  },
  loader: async ({ params: { id } }) => {
    const post = await getPostByIdFn({ data: parseInt(id) })
    if (!post) {
      throw new Error('Post not found')
    }
    return { post }
  },
  component: EditPost,
})

function EditPost() {
  const { post } = Route.useLoaderData()
  const router = useRouter()
  const [title, setTitle] = useState(post.title)
  const [content, setContent] = useState(post.content)
  const [type, setType] = useState<'blog' | 'news'>(post.type as 'blog' | 'news')
  const [slug, setSlug] = useState(post.slug)
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const finalSlug = slug || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
      
      await updatePostFn({
        data: {
          id: post.id,
          title,
          content,
          excerpt: content.slice(0, 100) + '...',
          type,
          slug: finalSlug,
        }
      })
      
      router.navigate({ to: '/admin/posts' })
    } catch (err) {
      console.error(err)
      alert('Failed to update post')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-[#141210]/80 border border-[#C04A2A]/20 p-8 lg:p-10 rounded-sm text-[#F0E8D8] relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C04A2A]/50 to-transparent opacity-50" />
      
      <div className="mb-8 border-b border-[#C04A2A]/20 pb-6">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#C04A2A] font-medium mb-2">Hantera</p>
        <h1 className="font-display text-3xl tracking-wide">Redigera Inlägg</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative group">
          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#C04A2A] mb-2">Typ</label>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value as 'blog' | 'news')}
            className="w-full p-3 bg-[#1A1816]/50 border border-[#C04A2A]/20 focus:border-[#C04A2A]/60 outline-none rounded-sm text-[#F0E8D8] text-sm transition-all appearance-none cursor-pointer"
          >
            <option value="blog">Blogginlägg</option>
            <option value="news">Nyhetsartikel</option>
          </select>
          <div className="absolute right-3 top-[34px] pointer-events-none text-[#C04A2A]">▼</div>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#C04A2A] mb-2">Titel</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 bg-[#1A1816]/50 border border-[#C04A2A]/20 focus:border-[#C04A2A]/60 outline-none rounded-sm text-[#F0E8D8] text-sm transition-all"
            required
            placeholder="Skriv titel här..."
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#C04A2A] mb-2">Slug (URL)</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Genereras automatiskt om tom"
            className="w-full p-3 bg-[#1A1816]/50 border border-[#C04A2A]/20 focus:border-[#C04A2A]/60 outline-none rounded-sm text-[#F0E8D8] text-sm font-mono transition-all placeholder:text-[#F0E8D8]/20"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-[0.2em] text-[#C04A2A] mb-2">Innehåll</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-64 p-4 bg-[#1A1816]/50 border border-[#C04A2A]/20 focus:border-[#C04A2A]/60 outline-none rounded-sm text-[#F0E8D8] text-sm transition-all resize-y"
            required
            placeholder="Börja skriva ditt inlägg..."
          />
        </div>

        <div className="flex justify-end gap-6 pt-6 border-t border-[#C04A2A]/20 items-center">
          <a href="/admin/posts" className="text-[11px] uppercase tracking-[0.15em] font-medium text-[#F0E8D8]/50 hover:text-[#F0E8D8] transition-colors">Avbryt</a>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-[#C04A2A] text-white text-[11px] uppercase tracking-[0.15em] font-medium rounded-sm hover:bg-[#A03A1A] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(192,74,42,0.3)] disabled:opacity-50"
          >
            {isSaving ? 'Sparar...' : 'Spara Ändringar'}
          </button>
        </div>
      </form>
    </div>
  )
}
