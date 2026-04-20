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

      {/* Cities of Ã–stergÃ¶wFÆæB6V7F–öâ¢÷Ð¢Ç6V7F–öâ6Æ74æÖSÒ&&rÖ&6¶w&÷VæB&÷&FW"×B&÷&FW"Ö&÷&FW"#à¢ÆF—b6Æ74æÖSÒ&×‚ÖWFòÖ‚×rÓg†Â‚Ób’Ó##à¢ÆF—b6Æ74æÖSÒ&Ö"Ó"#à¢Ç6Æ74æÖSÒ'FW‡B×6ÒföçBÖÖVF—VÒG&6¶–ær×v–FW7BFW‡B×&–Ö'’WW&66RÖ"Ó2#åWL:F6³Â÷à¢Æƒ"6Æ74æÖSÒ&föçBÖF—7Æ’FW‡BÓG†ÂÖC§FW‡BÓW†ÂFW‡BÖf÷&Vw&÷VæB#å7L:FFW"’9g7FW&|;gtland</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* NorrkÃ¶ping Card */}
            <article className="group border border-border bg-card p-8 transition-all hover:border-primary/50">
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaoLCZsAIYEk4sJGANU9T5_zkxZBwWi5Fmcg&s" 
                alt="NorrkÃ¶ping industrial landscape" 
                className="w-full h-48 object-cover mb-6 rounded-sm" 
              />
              <h3 className="font-display text-2xl md:text-3xl text-foreground mb-3">
                Norrk&ouml;ping
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                KÃ¤nd som Sveriges Manchester, benÃ¶md fÃ¶r sitt historiska industrilandskap lÃ¤ngs Motala strÃ¶m.
              </p>
            </article>

            {/* Link&ouml;ping Card */}
            <article className="group border border-border bg-card p-8 transition-all hover:border-primary/50">
              <img 
                src="https://c8.alamy.com/comp/2C799PF/aerial-view-of-linkping-city-sweden-linkping-cathedral-photo-jeppe-gustafsson-2C799PF.jpg" 
                alt="Link&ouml;ping city Sweden" 
                className="w-full h-48 object-cover mb-6 rounded-sm" 
              />
              <h3 className="font-display text-2xl md:text-3xl text-foreground mb-3">
                Link&ouml;ping
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                En stor universitetsstad och flyghuvudstaden i Sverige, hem till en vacker medeltida domkarka.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Latest Content Section */}
      <section className="bg-background border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12">
            <p className="text-sm font-medium tracking-widest text-primary uppercase mb-3">Senaste</p>
            <h2 className="font-bold text-3xl md:text-4xl text-foreground">Blogg & Nyheter</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Blog Card */}
            <article className="group border border-border bg-card p-8 transition-all hover:border-primary/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-1 bg-primary/20" />
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
                    {latestBlog.excerpt || 'Las senaste blogginlagget.'}
                  </p>
                  <a 
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-foreground transition-colors" 
                    href={`/blogs/${latestBlog.slug}`}
                  >
                    Las mer
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </>
              ) : (
                <p className="text-muted-foreground">Ingen blogg publicerad annu.</p>
              )}
            </article>

            {/* News Card */}
            <article className="group border border-border bg-card p-8 transition-all hover:border-primary/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-1 bg-primary/20" />
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
                    {latestNews.excerpt || 'Las senaste nyheten.'}
                  </p>
                  <a 
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-foreground transition-colors" 
                    href={`/nyheter/${latestNews.slug}`}
                  >
                    Las mer
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </>
              ) : (
                <p className="text-muted-foreground">Ingen nyhet publicerad antu.</p>
              )}
            </article>
          </div>
        </div>
      </section>
    </>
  )
}
