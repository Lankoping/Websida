'use client'

type Locale = 'sv' | 'en'

const fallbackContent = {
  sv: {
    eyebrow: 'LAN-Event i Norrköping',
    headline: 'Lankoping',
    tagline: 'Gaming Community',
    description: 'Vi bygger en gemenskap för gamers i Östergötland. Snart öppnar vi dörrar till vårt första event.',
    rulesLabel: 'Regler',
    teamLabel: 'Team',
    privacyLabel: 'Datapolicy',
    rights: 'Alla rättigheter förbehållna',
  },
  en: {
    eyebrow: 'LAN Event in Norrkoping',
    headline: 'Lankoping',
    tagline: 'Gaming Community',
    description: 'We are building a community for gamers in Ostergotland. Soon we open doors to our first event.',
    rulesLabel: 'Rules',
    teamLabel: 'Team',
    privacyLabel: 'Data Policy',
    rights: 'All rights reserved',
  },
} as const

export function ComingSoon({ locale = 'sv' }: { locale?: Locale }) {
  const content = {
    eyebrow: fallbackContent[locale].eyebrow,
    headline: fallbackContent[locale].headline,
    tagline: fallbackContent[locale].tagline,
    description: fallbackContent[locale].description,
    primaryButtonText: 'Discord',
    primaryButtonLink: 'https://discord.gg/h8wuayqBwT',
    secondaryButtonText: '',
    secondaryButtonLink: '',
  }
  
  return (
    <>
      <section className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center">
          {/* Eyebrow */}
          <p className="text-sm font-medium tracking-widest text-primary uppercase mb-6 text-center">
            {content.eyebrow}
          </p>
          
          {/* Main Headline */}
          <h1 className="font-bold text-3xl md:text-5xl tracking-tight text-foreground mb-6 text-center">
            {content.headline}
          </h1>
          
          {/* Tagline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-center">
            {content.tagline}
          </p>

          {/* Divider */}
          <div className="w-12 h-1 bg-primary/20 mx-auto mb-10" />
          
          {/* Description */}
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-12 text-center">
            {content.description}
          </p>

          {/* Primary Button */}
          <div className="flex justify-center">
            <a 
              href={content.primaryButtonLink} 
              target={content.primaryButtonLink.startsWith('http') ? '_blank' : undefined}
              rel={content.primaryButtonLink.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="px-8 py-3 bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              {content.primaryButtonText}
            </a>
            {/* Secondary Button */}
            {content.secondaryButtonText && (
              <a 
                href={content.secondaryButtonLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-8 py-3 border border-border text-foreground font-medium hover:bg-secondary transition-colors ml-4"
              >
                {content.secondaryButtonText}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="border-t border-border w-full">
        <div className="max-w-6xl mx-auto px-6 py-24 flex flex-col items-center">
          <div className="grid md:grid-cols-2 gap-12 w-full max-w-4xl">
            <div className="flex flex-col items-center text-center">
              <div className="relative w-full h-48 overflow-hidden rounded-lg mb-4">
                <img src="https://images.unsplash.com/photo-1577717903323-b67e7c85859d?auto=format&fit=crop&q=80&w=800" alt="Norrköping" className="w-full h-full object-cover mx-auto" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20" />
              </div>
              <h3 className="font-bold text-lg tracking-wider mb-2 text-foreground text-center">
                {locale === 'sv' ? 'GEMENSKAP' : 'COMMUNITY'}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed text-center">
                {locale === 'sv' 
                  ? 'En plats för gamers att träffas, tävla och ha kul tillsammans i en inkluderande miljö.' 
                  : 'A place for gamers to meet, compete and have fun together in an inclusive environment.'}
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="relative w-full h-48 overflow-hidden rounded-lg mb-4">
                <img src="https://images.unsplash.com/photo-1577717903323-b67e7c85859d?auto=format&fit=crop&q=80&w=800" alt="Norrköping" className="w-full h-full object-cover mx-auto" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20" />
              </div>
              <h3 className="font-bold text-lg tracking-wider mb-2 text-foreground text-center">
                {locale === 'sv' ? 'LAN-PARTY' : 'LAN PARTY'}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed text-center">
                {locale === 'sv' 
                  ? 'Ta med din dator och njut av en helg fylld med gaming, tävlingar och nya vänner.' 
                  : 'Bring your computer and enjoy a weekend filled with gaming, competitions and new friends.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
