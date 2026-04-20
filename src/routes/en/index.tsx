import { ComingSoon } from '@/components/coming-soon'
import { createFileRoute } from '@tanstack/react-router'
import { getPostsTranslatedToEnglishFn } from '../../server/functions/posts'
import { getHeroContentFn, getInfoSectionsFn } from '../../server/functions/cms'

export const Route = createFileRoute('/en/')({
  head: () => ({
    meta: [
      {
        title: 'Lankoping.se - Coming Soon',
      },
      {
        name: 'description',
        content:
          'Lankoping.se is finishing the final details and will be launching soon.',
      },
      {
        property: 'og:title',
        content: 'Lankoping.se - Coming Soon',
      },
      {
        property: 'og:description',
        content:
          'Lankoping.se is finishing the final details and will be launching soon.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:locale',
        content: 'en_GB',
      },
    ],
  }),
  loader: async () => {
    try {
      const [blogs, news, heroContent, infoSections] = await Promise.all([
        getPostsTranslatedToEnglishFn({ data: 'blog' }),
        getPostsTranslatedToEnglishFn({ data: 'news' }),
        getHeroContentFn(),
        getInfoSectionsFn(),
      ])

      return {
        latestBlog: blogs[0] ?? null,
        latestNews: news[0] ?? null,
        heroContent,
        infoSections,
      }
    } catch {
      return {
        latestBlog: null,
        latestNews: null,
        heroContent: null,
        infoSections: [],
      }
    }
  },
  component: Index,
})

function Index() {
  const { latestBlog, latestNews, heroContent, infoSections } = Route.useLoaderData()

  return (
    <>
      <ComingSoon locale="en" heroData={heroContent} infoSectionsData={infoSections} />

      (* Cities of Ã–stergÃ¶wFÆæB6V7F–öâ¢ò¢Ç6V7F–öâ6Æ74æÖSÒ&&rÖ&6¶w&÷VæB&÷&FW"×B&÷&FW"Ö&÷&FW"#à¢ÆF—b6Æ74æÖSÒ&×‚ÖWFòÖ‚×rÓg†Â‚Ób’Ó##à¢ÆF—b6Æ74æÖSÒ&Ö"Ó"#à¢Ç6Æ74æÖSÒ'FW‡B×6ÒföçBÖÖVF—VÒG&6¶–ær×v–FW7BFW‡B×&–Ö'’WW&66RÖ"Ó2#äF—66÷fW#Â÷à¢Æƒ"6Æ74æÖSÒ&föçBÖF—7Æ’FW‡BÓG†ÂÖC§FW‡BÓW†ÂFW‡BÖf÷&Vw&÷VæB#ä6—F–W2öb9g7FW&|;gtland</h2>
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
                Known as Sweden's Manchester, famous for its historic industrial landscape along the Motala str&ouml;m river.
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
                A major university city and the aviation capital of Sweden, home to a beautiful medieval cathedral.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Latest Content Section */}
      <section className="bg-background border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12">
            <p className="text-sm font-medium tracking-widest text-primary uppercase mb-3">Latest</p>
            <h2 className="font-display text-4xl md:text-5xl text-foreground">Blog & News</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Blog Card */}
            <article className="group border border-border bg-card p-8 transition-all hover:border-primary/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 bg-primary" />
                <span className="text-xs font-medium tracking-widest text-primary uppercase">Blog</span>
              </div>
              {latestBlog ? (
                <>
                  <h3 className="font-display text-2xl md:text-3xl text-foreground mb-3">
                    {latestBlog.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {latestBlog.createdAt ? new Date(latestBlog.createdAt).toLocaleDateString('en-GB') : ''}
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {latestBlog.excerpt || 'Read our latest blog post.'}
                  </p>
                  <a 
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-foreground transition-colors" 
                    href={`/en/blogs/${latestBlog.slug}`}
                  >
                    Read more
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </>
              ) : (
                <p className="text-muted-foreground">No blog posts published yet.</p>
              )}
            </article>

            {/* News Card */}
            <article className="group border border-border bg-card p-8 transition-all hover:border-primary/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 bg-primary" />
                <span className="text-xs font-medium tracking-widest text-primary uppercase">News</span>
              </div>
              {latestNews ? (
                <>
                  <h3 className="font-display text-2xl md:text-3xl text-foreground mb-3">
                    {latestNews.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {latestNews.createdAt ? new Date(latestNews.createdAt).toLocaleDateString('en-GB') : ''}
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {latestNews.excerpt || 'Read our latest news update.'}
                  </p>
                  <a 
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-foreground transition-colors" 
                    href={`/en/nyheter/${latestNews.slug}`}
                  >
                    Read more
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </>
              ) : (
                <p className="text-muted-foreground">No news published yet.</p>
              )}
            </article>
          </div>
        </div>
      </section>
    </>
  )
}
