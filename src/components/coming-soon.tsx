'use client'

import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getHeroContentFn, getInfoSectionsFn } from '@/server/functions/cms'
import * as Icons from 'lucide-react'

// Map icon names to lucide-react components
function getIconByName(iconName: string) {
  const iconMap: Record<string, React.ComponentType<any>> = {
    MapPin: Icons.MapPin,
    Users: Icons.Users,
    Gamepad2: Icons.Gamepad2,
    Crown: Icons.Crown,
    Code: Icons.Code,
    Heart: Icons.Heart,
    Star: Icons.Star,
    Zap: Icons.Zap,
    Shield: Icons.Shield,
    Target: Icons.Target,
    Trophy: Icons.Trophy,
    Flame: Icons.Flame,
  }
  return iconMap[iconName] || null
}

type Locale = 'sv' | 'en'

interface ComingSoonProps {
  locale?: Locale
  heroData?: Awaited<ReturnType<typeof getHeroContentFn>> | null
  infoSectionsData?: Awaited<ReturnType<typeof getInfoSectionsFn>> | null
}

const fallbackContent = {
  sv: {
    eyebrow: 'LAN-Event i Norrkoping',
    headline: 'Lankoping',
    tagline: 'Gaming Community',
    description: 'Vi bygger en gemenskap for gamers i Ostergotland. Snart oppnar vi dorrar till vart forsta event.',
    rulesLabel: 'Regler',
    teamLabel: 'Team',
    privacyLabel: 'Integritet',
    rights: 'Alla rättigheter förbehållna',
  },
  en: {
    eyebrow: 'LAN Event in Norrkoping',
    headline: 'Lankoping',
    tagline: 'Gaming Community',
    description: 'We are building a community for gamers in Ostergotland. Soon we open doors to our first event.',
    rulesLabel: 'Rules',
    teamLabel: 'Team',
    privacyLabel: 'Privacy',
    rights: 'All rights reserved',
  },
} as const

export function ComingSoon({ locale = 'sv', heroData, infoSectionsData }: ComingSoonProps) {
  const basePath = locale === 'en' ? '/en' : ''
  
  const content = {
    eyebrow: locale === 'en' ? (heroData?.eyebrowEn || heroData?.eyebrow || fallbackContent.en.eyebrow) : (heroData?.eyebrow || fallbackContent.sv.eyebrow),
    headline: locale === 'en' ? (heroData?.headlineEn || heroData?.headline || fallbackContent.en.headline) : (heroData?.headline || fallbackContent.sv.headline),
    tagline: locale === 'en' ? (heroData?.taglineEn || heroData?.tagline || fallbackContent.en.tagline) : (heroData?.tagline || fallbackContent.sv.tagline),
    description: locale === 'en' ? (heroData?.descriptionEn || heroData?.description || fallbackContent.en.description) : (heroData?.description || fallbackContent.sv.description),
    primaryButtonText: locale === 'en' ? (heroData?.primaryButtonTextEn || heroData?.primaryButtonText || fallbackContent.en.rulesLabel) : (heroData?.primaryButtonText || fallbackContent.sv.rulesLabel),
    primaryButtonLink: heroData?.primaryButtonLink || 'https://discord.gg/h8wuaqyBwT',
    secondaryButtonText: locale === 'en' ? heroData?.secondaryButtonTextEn : heroData?.secondaryButtonText,
    secondaryButtonLink: heroData?.secondaryButtonLink || 'https://www.youtube.com/@LANKPNG',
    rulesLabel: locale === 'en' ? fallbackContent.en.rulesLabel : fallbackContent.sv.rulesLabel,
    teamLabel: locale === 'en' ? fallbackContent.en.teamLabel : fallbackContent.sv.teamLabel,
    privacyLabel: locale === 'en' ? fallbackContent.en.privacyLabel : fallbackContent.sv.privacyLabel,
    rights: locale === 'en' ? fallbackContent.en.rights : fallbackContent.sv.rights,
  }
  
  const infoSections = infoSectionsData || []

  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-bold text-xl tracking-tight text-foreground">Lankoping</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link to={`${basePath}/rules`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {content.rulesLabel}
            </Link>
            <Link to={`${basePath}/team`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {content.teamLabel}
            </Link>
            <Link to={`${basePath}/privacy`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {content.privacyLabel}
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <a 
              href="https://discord.gg/h8wuaqyBwT" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Discord
            </a>
          </div>
        </div>
      </header>

      {/* Main Content - grows to fill available space */}
      <main className="flex-1 pt-20">
        <section className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* Eyebrow */}
            <p className="text-sm font-medium tracking-widest text-primary uppercase mb-6">
              {content.eyebrow}
            </p>
            
            {/* Main Headline */}
            <h1 className="font-bold text-3xl md:text-5xl tracking-tight text-foreground mb-6">
              {content.headline}
            </h1>
            
            {/* Tagline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              {content.tagline}
            </p>

            {/* Divider */}
            <div className="w-12 h-1 bg-primary/20 mx-auto mb-10" />
            
            {/* Description */}
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-12">
              {content.description}
            </p>

            {/* Primary Button */}
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
                className="px-8 py-3 border border-border text-foreground font-medium hover:bg-secondary transition-colors"
              >
                {content.secondaryButtonText}
              </a>
            )}
          </div>
        </section>

        {/* Info Section */}
        {infoSections.length > 0 && (
          <section className="border-t border-border">
            <div className="max-w-6xl mx-auto px-6 py-24">
              <div className="grid md:grid-cols-3 gap-12">
                {infoSections.map((section) => {
                  const IconComponent = getIconByName(section.icon)
                  const title = locale === 'en' ? section.titleEn || section.title : section.title
                  const desc = locale === 'en' ? section.descriptionEn || section.description : section.description
                  
                  return (
                    <div key={section.id}>
                      <div className="relative w-full h-48 overflow-hidden rounded-lg mb-4">
                        <img src="https://images.unsplash.com/photo-1577717903323-b67e7c85859d?auto=format&fit=crop&q=80&w=800" alt="Norrköping" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          {IconComponent ? <IconComponent className="w-8 h-8 text-white" /> : null}
                        </div>
                      </div>
                      <h3 className="font-bold text-lg tracking-wider mb-2 text-foreground">{title.toUpperCase()}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer - stays at bottom */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center">
              <span className="font-bold text-lg text-foreground">Lankoping</span>
              <span className="text-muted-foreground text-sm">.se</span>
            </div>
            <nav className="flex items-center gap-6 md:hidden">
              <Link to={`${basePath}/rules`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {content.rulesLabel}
              </Link>
              <Link to={`${basePath}/team`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {content.teamLabel}
              </Link>
              <Link to={`${basePath}/privacy`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {content.privacyLabel}
              </Link>
            </nav>
            <p className="text-sm text-muted-foreground text-center md:text-right">
              © 2026 Lankoping.se — {content.rights}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
