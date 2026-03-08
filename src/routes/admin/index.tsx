import { createFileRoute, useRouter } from '@tanstack/react-router'
import { getPostsFn, deletePostFn } from '../../server/functions/posts'
import { useState } from 'react'

export const Route = createFileRoute('/admin/')({
  loader: async () => {
    const [blogs, news] = await Promise.all([
      getPostsFn({ data: 'blog' }),
      getPostsFn({ data: 'news' })
    ])
    return {
      posts: [...blogs, ...news].sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return bTime - aTime
      })
    }
  },
  component: AdminDashboard,
})

function AdminDashboard() {
  const { posts } = Route.useLoaderData()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

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
    const searchLower = searchQuery.toLowerCase();
    return (
      post.title?.toLowerCase().includes(searchLower) ||
      post.slug?.toLowerCase().includes(searchLower) ||
      post.excerpt?.toLowerCase().includes(searchLower) ||
      post.type?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="bg-[#141210]/80 border border-[#C04A2A]/20 p-5 sm:p-8 lg:p-10 rounded-sm text-[#F0E8D8] relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C04A2A]/50 to-transparent opacity-50" />
      
      <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-8 gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl tracking-wide mb-2">Översikt</h2>
          <p className="text-[#F0E8D8]/60 text-sm">Hantera innehåll och blogginlägg.</p>
        </div>
        <a href="/admin/new" className="px-6 py-3 bg-[#C04A2A] text-white text-[11px] uppercase tracking-[0.15em] font-medium rounded-sm hover:bg-[#A03A1A] hover:scale-[1.02] active:scale-[0.98] transition-all inline-flex justify-center shadow-[0_0_15px_rgba(192,74,42,0.3)] whitespace-nowrap">
          Skapa Nytt
        </a>
      </div>

      <div className="mb-6 p-4 bg-[#1A1816]/50 border border-[#C04A2A]/20 rounded-sm">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Sök på titel, typ eller text..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-10 bg-[#100E0C] border border-[#C04A2A]/20 focus:border-[#C04A2A]/60 outline-none rounded-sm text-[#F0E8D8] text-sm font-mono transition-all placeholder:text-[#F0E8D8]/30"
          />
          <span className="absolute left-3 top-[10px] text-[#C04A2A]/50 text-lg">⌕</span>
        </div>
      </div>
      
      <div className="grid gap-6 xl:gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredPosts.map((post) => (
          <div key={post.id} className="relative group/card p-6 bg-[#1A1816]/80 border border-[#C04A2A]/20 hover:border-[#C04A2A]/50 rounded-sm shadow-md transition-all hover:bg-[#1C1A18]">
            {/* Corner accent */}
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#C04A2A] opacity-0 group-hover/card:opacity-100 transition-opacity" />
            
            <div className="flex justify-between items-start mb-4">
              <span className={`px-2 py-1 text-[9px] font-medium uppercase tracking-[0.2em] border ${post.type === 'blog' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' : 'border-[#C04A2A]/30 text-[#C04A2A] bg-[#C04A2A]/10'}`}>
                {post.type}
              </span>
              <span className="text-[10px] text-[#F0E8D8]/40 font-medium tracking-wider">{new Date(post.createdAt!).toLocaleDateString()}</span>
            </div>
            <h3 className="font-display tracking-wide text-[#F0E8D8] text-xl mb-3 truncate">{post.title}</h3>
            <p className="text-[#F0E8D8]/60 text-sm line-clamp-3 mb-6 leading-relaxed">{post.excerpt}</p>
            <div className="flex justify-end gap-4 text-[10px] tracking-wider uppercase font-medium mt-auto">
              <a href={`/admin/edit/${post.id}`} className="text-[#F0E8D8]/50 hover:text-[#F0E8D8] transition-colors cursor-pointer block">Redigera</a>
              <button onClick={() => handleDelete(post.id)} className="text-red-500/60 hover:text-red-400 transition-colors cursor-pointer">Radera</button>
            </div>
          </div>
        ))}
        {filteredPosts.length === 0 && (
          <div className="col-span-full text-center py-16 text-[#F0E8D8]/50 bg-[#1A1816]/30 border border-dashed border-[#C04A2A]/30 rounded-sm">
            <p className="font-serif italic text-lg mb-4">
              {posts.length === 0 ? "Inget innehåll hittades." : "Inga inlägg matchade din sökning."}
            </p>
            {posts.length === 0 && (
              <a href="/admin/new" className="mt-2 bg-[#C04A2A]/20 border border-[#C04A2A]/40 hover:bg-[#C04A2A]/40 px-6 py-2 text-[#F0E8D8] rounded-sm inline-block text-[11px] uppercase tracking-wider transition-all">Skapa ditt första inlägg</a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
