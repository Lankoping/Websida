import { ComingSoon } from '@/components/coming-soon'
import { createFileRoute } from '@tanstack/react-router'
import { getPostsFn } from '../../server/functions/posts'
import { getHeroContentFn, getInfoSectionsFn } from '../../server/functions/cms'

export const Route = createFileRoute('/_public/')({
  loader: async () => {
    try {
      const [blogs, news, hero, infoSections] = await Promise.all([
        getPostsFn({ data: 'blog' }),
        getPostsFn({ data: 'news' }),
        getHeroContentFn(),
        getInfoSectionsFn(),
      ])

      return {
        latestBlog: blogs[0] ?? null,
        latestNews: news[0] ?? null,
        heroData: hero,
        infoSectionsData: infoSections,
      }
    } catch (error) {
      console.error('[v0] Error loading homepage data:', error)
      return {
        latestBlog: null,
        latestNews: null,
        heroData: null,
        infoSectionsData: null,
      }
    }
  },
  component: Index,
})

function Index() {
  const { latestBlog, latestNews, heroData, infoSectionsData } = Route.useLoaderData()

  return (
    <>
      <ComingSoon locale="sv" heroData={heroData} infoSectionsData={infoSectionsData} />

      <section className="bg-background border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="group">
              <div className="relative w-full h-48 overflow-hidden rounded-lg mb-4">
                <img src="https://images.unsplash.com/photo-1577717903323-b67e7c85859d?auto=format&fit=crop&q=80&w=800" alt="Norrköping" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20"></div>
              </div>
              <h3 className="font-bold text-lg tracking-wider mb-2 text-foreground">NORRKOPING</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Vårt första event kommer att hållas i Norrkoping, Ostergotland med modern utrustning och snabbt internet.</p>
            </div>
            <div className="group">
              <div className="relative w-full h-48 overflow-hidden rounded-lg mb-4">
                <img src="https://images.unsplash.com/photo-1577717903323-b67e7c85859d?auto=format&fit=crop&q=80&w=800" alt="Norrköping" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20"></div>
              </div>
              <h3 className="font-bold text-lg tracking-wider mb-2 text-foreground">GEMENSKAP</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">En plats för gamers att träffas, tävla och ha kul tillsammans i en inkluderande miljö.</p>
            </div>
            <div className="group">
              <div className="relative w-full h-48 overflow-hidden rounded-lg mb-4">
                <img src="https://images.unsplash.com/photo-1577717903323-b67e7c85859d?auto=format&fit=crop&q=80&w=800" alt="Norrköping" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20"></div>
              </div>
              <h3 className="font-bold text-lg tracking-wider mb-2 text-foreground">LAN-PARTY</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Ta med din dator och njut av en helg fylld med gaming, tävlingar och nya vänner.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12">
            <p className="text-sm font-medium tracking-widest text-primary uppercase mb-3">Senaste</p>
            <h2 className="font-bold text-3xl md:text-4xl text-foreground">Blogg & Nyheter</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <article className="group border border-border bg-card p-8 transition-all hover:border-primary/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 bg-primary" />
                <span className="text-xs font-medium tracking-widest text-primary uppercase">Blogg</span>
              </div>
              {latestBlog ? (
                <>
                  <h3 className="font-bold text-xl md:text-2xl text-foreground mb-3">
                    {latestBlog.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {latestBlog.createdAt ? new Date(latestBlog.createdAt).toLocaleDateString('sv-SE') : ''}
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {latestBlog.excerpt || 'Läs senaste blogginlägget.'}
                  </p>
                  <a 
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-foreground transition-colors" 
                    href={`/blogs/${latestBlog.slug}`}
                  >
                    Läs mer
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </>
              ) : (
                <p className="text-muted-foreground">Ingen blogg publicerad än.</p>
              )}
            </article>

            <article className="group border border-border bg-card p-8 transition-all hover:border-primary/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 bg-primary" />
                <span className="text-xs font-medium tracking-widest text-primary uppercase">Nyhet</span>
              </div>
              {latestNews ? (
                <>
                  <h3 className="font-bold text-xl md:text-2xl text-foreground mb-3">
                    {latestNews.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {latestNews.createdAt ? new Date(latestNews.createdAt).toLocaleDateString('sv-SE') : ''}
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {latestNews.excerpt || 'Läs senaste nyheten.'}
                  </p>
                  <a 
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-foreground transition-colors" 
                    href={`/nyheter/${latestNews.slug}`}
                  >
                    Läs mer
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </>
              ) : (
                <p className="text-muted-foreground">Ingen nyhet publicerad än.</p>
              )}
            </article>
          </div>
        </div>
      </section>
    </>
  )
}
