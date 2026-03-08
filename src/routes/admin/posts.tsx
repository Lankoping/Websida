import { createFileRoute, useRouter } from '@tanstack/react-router'
import { getPostsFn, deletePostFn } from '../../server/functions/posts'
import { useState } from 'react'

export const Route = createFileRoute('/admin/posts')({
  loader: async () => {
    const [blogPosts, newsPosts] = await Promise.all([
      getPostsFn({ data: 'blog' }),
      getPostsFn({ data: 'news' }),
    ])

    return {
      posts: [...blogPosts, ...newsPosts].sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return bTime - aTime
      }),
    }
  },
  component: AdminPosts,
})

function AdminPosts() {
  const { posts } = Route.useLoaderData()
  const router = useRouter()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'blog' | 'news'>('all')

  const handleDelete = async (id: number) => {
    if (window.confirm('Är du säker på att du vill radera detta inlägg?')) {
      try {
        await deletePostFn({ data: id })
        await router.invalidate()
      } catch (err) {
        console.error(err)
        alert('Kunde inte radera inlägget')
      }
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesType = typeFilter === 'all' || post.type === typeFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      post.title?.toLowerCase().includes(searchLower) || 
      post.slug?.toLowerCase().includes(searchLower) ||
      post.content?.toLowerCase().includes(searchLower);
      
    return matchesType && matchesSearch;
  });

  return (
    <div className="bg-[#141210]/80 border border-[#C04A2A]/20 p-5 sm:p-8 lg:p-10 rounded-sm text-[#F0E8D8] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C04A2A]/50 to-transparent opacity-50" />
      
      <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-8 gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#C04A2A] font-medium mb-2">Hantera</p>
          <h2 className="font-display text-2xl sm:text-3xl tracking-wide">Alla Inlägg</h2>
        </div>
        <a
          href="/admin/new"
          className="px-6 py-3 bg-[#C04A2A] text-white text-[11px] uppercase tracking-[0.15em] font-medium rounded-sm hover:bg-[#A03A1A] hover:scale-[1.02] active:scale-[0.98] transition-all inline-flex justify-center shadow-[0_0_15px_rgba(192,74,42,0.3)] whitespace-nowrap"
        >
          Skapa Nytt
        </a>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4 p-4 bg-[#1A1816]/50 border border-[#C04A2A]/20 rounded-sm">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Sök på titel, slug eller innehåll..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-10 bg-[#100E0C] border border-[#C04A2A]/20 focus:border-[#C04A2A]/60 outline-none rounded-sm text-[#F0E8D8] text-sm font-mono transition-all placeholder:text-[#F0E8D8]/30"
          />
          <span className="absolute left-3 top-[10px] text-[#C04A2A]/50 text-lg">⌕</span>
        </div>
        
        <div className="relative md:w-48 group">
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full p-3 bg-[#100E0C] border border-[#C04A2A]/20 focus:border-[#C04A2A]/60 outline-none rounded-sm text-[#F0E8D8] text-sm transition-all appearance-none cursor-pointer uppercase text-[11px] tracking-wider"
          >
            <option value="all">Alla typer</option>
            <option value="blog">Endast Blogg</option>
            <option value="news">Endast Nyheter</option>
          </select>
          <div className="absolute right-3 top-[12px] pointer-events-none text-[#C04A2A]/50 text-[10px]">▼</div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div key={post.id} className="relative group p-4 sm:p-6 bg-[#1A1816]/50 border border-[#C04A2A]/20 hover:border-[#C04A2A]/50 rounded-sm transition-all hover:bg-[#1C1A18]">
            <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-[#C04A2A] opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full overflow-hidden">
              <div className="min-w-0 pr-4">
                <a href={`/admin/edit/${post.id}`} className="font-display text-lg sm:text-xl tracking-wide text-[#F0E8D8] hover:text-[#C04A2A] transition-colors mb-1 block truncate">
                  {post.title}
                </a>
                <p className="text-xs text-[#F0E8D8]/40 font-mono tracking-tight truncate">/{post.slug}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0">
                <span className={`px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium border ${post.type === 'blog' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : 'border-[#C04A2A]/30 text-[#C04A2A] bg-[#C04A2A]/10'}`}>{post.type}</span>
                <a href={`/admin/edit/${post.id}`} className="text-[#F0E8D8]/50 hover:text-[#F0E8D8] transition-colors text-[10px] uppercase tracking-wider font-medium ml-1 sm:ml-2">Redigera</a>
                <button onClick={() => handleDelete(post.id)} className="text-red-500/60 hover:text-red-400 transition-colors text-[10px] uppercase tracking-wider font-medium ml-1 sm:ml-2">Radera</button>
              </div>
            </div>
          </div>
        ))}
        {filteredPosts.length === 0 && (
          <div className="text-center py-16 text-[#F0E8D8]/50 bg-[#1A1816]/30 border border-dashed border-[#C04A2A]/30 rounded-sm">
            <p className="font-serif italic text-lg mb-4">
              {posts.length === 0 ? "Inga inlägg ännu." : "Inga inlägg matchade din sökning."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
