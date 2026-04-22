import { ComingSoon } from '@/components/coming-soon'
import { createFileRoute } from '@tanstack/react-router'
import { getPostsFn } from '../../server/functions/posts'

export const Route = createFileRoute('/_public/')({
  loader: async () => {
    try {
      const [blogs, news] = await Promise.all([
        getPostsFn({ data: 'blog' }),
        getPostsFn({ data: 'news' }),
      ])

      return {
        latestBlog: blogs[0] ?? null,
        latestNews: news[0] ?? null,
      }
    } catch (error) {
      console.error('[v0] Error loading homepage data:', error)
      return {
        latestBlog: null,
        latestNews: null,
      }
    }
  },
  component: Index,
})

function Index() {
  const { latestBlog, latestNews } = Route.useLoaderData()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <ComingSoon locale="sv" />

      <section className="w-full bg-background border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-24 flex flex-col items-center justify-center text-center">
          <div className="group max-w-2xl text-center flex flex-col items-center">
            <div className="relative w-full h-64 overflow-hidden rounded-lg mb-8">
              <img src="https://www.interkultur.com/fileadmin/_processed_/0/2/csm_N-1-20220616-NicoleOlssen_37fb01bd34.jpg" alt="Strykjärnet Norrköping" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20"></div>
            </div>
            <h3 className="font-bold text-2xl tracking-wider mb-4 text-foreground">NORRKÖPING</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">Vårt första event kommer att hållas i Norrköping, Östergötland med modern utrustning och snabbt internet.</p>
          </div>
        </div>
      </section>

      <section className="w-full bg-background border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 flex flex-col items-center justify-center">
          <div className="mb-12 text-center flex flex-col items-center">
            <p className="text-sm font-medium tracking-widest text-primary uppercase mb-3">Senaste</p>
            <h2 className="font-bold text-3xl md:text-4xl text-foreground">Blogg & Nyheter</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 w-full max-w-4xl">
            <article className="group border border-border bg-card p-8 transition-all hover:border-primary/20 flex flex-col items-center">
              <div className="flex items-center gap-3 mb-6 justify-center">
                <div className="w-2 h-2 bg-primary" />
                <span className="text-xs font-medium tracking-widest text-primary uppercase">Blogg</span>
              </div>
              {latestBlog ? (
                <>
                  <h3 className="font-bold text-xl md:text-2xl text-foreground mb-3 text-center">
                    {latestBlog.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    {latestBlog.createdAt ? new Date(latestBlog.createdAt).toLocaleDateString('sv-SE') : ''}
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-6 text-center">
                    {latestBlog.excerpt || 'Läs senaste blogginlägget.'}
                  </p>
                  <div className="flex justify-center">
                    <a 
                      className="inline-flex items-center text-sm font-medium text-primary hover:text-foreground transition-colors" 
                      href={`/blogs/${latestBlog.slug}`}
                    >
                      Läs mer
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-center">Ingen blogg publicerad än.</p>
              )}
            </article>

            <article className="group border border-border bg-card p-8 transition-all hover:border-primary/20 flex flex-col items-center">
              <div className="flex items-center gap-3 mb-6 justify-center">
                <div className="w-2 h-2 bg-primary" />
                <span className="text-xs font-medium tracking-widest text-primary uppercase">Nyhet</span>
              </div>
              {latestNews ? (
                <>
                  <h3 className="font-bold text-xl md:text-2xl text-foreground mb-3 text-center">
                    {latestNews.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    {latestNews.createdAt ? new Date(latestNews.createdAt).toLocaleDateString('sv-SE') : ''}
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-6 text-center">
                    {latestNews.excerpt || 'Läs senaste nyheten.'}
                  </p>
                  <div className="flex justify-center">
                    <a 
                      className="inline-flex items-center text-sm font-medium text-primary hover:text-foreground transition-colors" 
                      href={`/nyheter/${latestNews.slug}`}
                    >
                      Läs mer
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-center">Ingen nyhet publicerad än.</p>
              )}
            </article>
          </div>
        </div>
      </section>
    </div>
  )
}
