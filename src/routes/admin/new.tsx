import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { createPostFn, fixPostSpellingFn } from '../../server/functions/posts'
import { getSessionFn } from '../../server/functions/auth'

function createExcerptFromMarkdown(markdown: string, maxLength = 120) {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_~\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (plain.length <= maxLength) {
    return plain
  }

  return `${plain.slice(0, maxLength).trim()}...`
}

export const Route = createFileRoute('/admin/new')({
  beforeLoad: async () => {
    const user = await getSessionFn()
    return { user }
  },
  loader: async ({ context: { user } }) => {
    return { user }
  },
  component: NewPost,
})

function NewPost() {
  const { user } = Route.useLoaderData()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState<'blog' | 'news'>('blog')
  const [slug, setSlug] = useState('')
  const [isFixingSpelling, setIsFixingSpelling] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const finalSlug = slug || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
      setSlug(finalSlug)
      
      const newPost = await createPostFn({
        data: {
          title,
          content,
          excerpt: createExcerptFromMarkdown(content),
          type,
          slug: finalSlug,
          authorId: user?.id
        }
      })
      
      router.navigate({ to: '/admin' })
    } catch (err) {
      console.error(err)
      alert('Failed to create post')
    }
  }

  const handleFixSpelling = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Fyll i titel och innehåll först.')
      return
    }

    setIsFixingSpelling(true)
    try {
      const fixed = await fixPostSpellingFn({
        data: {
          title,
          content,
        },
      })

      setTitle(fixed.title)
      setContent(fixed.content)

      if (!slug.trim()) {
        setSlug(fixed.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''))
      }
    } catch (error) {
      alert('Kunde inte fixa stavning just nu.')
    } finally {
      setIsFixingSpelling(false)
    }
  }

  return (
    <div className="bg-[#141210]/80 border border-[#C04A2A]/20 p-5 sm:p-8 lg:p-10 rounded-sm text-[#F0E8D8] relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C04A2A]/50 to-transparent opacity-50" />
      
      <div className="mb-8 border-b border-[#C04A2A]/20 pb-6">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#C04A2A] font-medium mb-2">Hantera</p>
        <h1 className="font-display text-2xl sm:text-3xl tracking-wide">Nytt Inlägg</h1>
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
          <div className="flex justify-end mt-3">
            <button
              type="button"
              disabled={isFixingSpelling}
              onClick={handleFixSpelling}
              className="px-4 py-2 bg-[#1A1816] border border-[#C04A2A]/40 text-[#F0E8D8] text-[10px] uppercase tracking-[0.15em] font-medium rounded-sm hover:border-[#C04A2A]/80 hover:text-white transition-all disabled:opacity-50"
            >
              {isFixingSpelling ? 'Fixar text...' : 'Fixa stavning (Gemini Flash)'}
            </button>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-4 sm:gap-6 pt-6 border-t border-[#C04A2A]/20 sm:items-center">
          <a href="/admin" className="text-[11px] uppercase tracking-[0.15em] font-medium text-[#F0E8D8]/50 hover:text-[#F0E8D8] transition-colors text-center py-3 sm:py-0 w-full sm:w-auto border border-[#F0E8D8]/10 sm:border-none rounded-sm">Avbryt</a>
          <button
            type="submit"
            className="px-6 py-3 bg-[#C04A2A] text-white text-[11px] uppercase tracking-[0.15em] font-medium rounded-sm hover:bg-[#A03A1A] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(192,74,42,0.3)] w-full sm:w-auto"
          >
            Publicera Innehåll
          </button>
        </div>
      </form>
    </div>
  )
}
